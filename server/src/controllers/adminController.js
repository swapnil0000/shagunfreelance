import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import AuditLog from '../models/AuditLog.js';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueAgg,
      newOrdersThisWeek,
      newCustomersThisWeek,
      ordersByStatus,
      revenueByDay,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),

      // Total revenue from paid orders
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),

      // Orders in last 7 days
      Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

      // New customers in last 7 days
      User.countDocuments({ role: 'customer', createdAt: { $gte: sevenDaysAgo } }),

      // Orders grouped by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Revenue per day for last 30 days
      Order.aggregate([
        { $match: { isPaid: true, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$total' },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top 5 products by revenue
      Order.aggregate([
        { $match: { isPaid: true } },
        { $unwind: '$items' },
        {
          $group: {
            _id:      '$items.product',
            name:     { $first: '$items.name' },
            revenue:  { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            quantity: { $sum: '$items.quantity' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalOrders,
          totalRevenue,
          totalCustomers,
          totalProducts,
          newOrdersThisWeek,
          newCustomersThisWeek,
        },
        ordersByStatus: ordersByStatus.map((s) => ({
          status: s._id,
          count:  s.count,
        })),
        revenueByDay,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', suspended } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (suspended !== undefined) {
      query.isSuspended = suspended === 'true';
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email phone avatar role isSuspended createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    // Attach order stats
    const userIds = users.map((u) => u._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id:        '$user',
          totalOrders: { $sum: 1 },
          totalSpent:  { $sum: { $cond: ['$isPaid', '$total', 0] } },
        },
      },
    ]);
    const statsMap = Object.fromEntries(
      orderStats.map((s) => [s._id.toString(), s])
    );

    const customers = users.map((u) => ({
      ...u.toObject(),
      totalOrders: statsMap[u._id.toString()]?.totalOrders || 0,
      totalSpent:  statsMap[u._id.toString()]?.totalSpent  || 0,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        customers,
        pagination: {
          total,
          page:       Number(page),
          limit:      Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: { isSuspended: user.isSuspended },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Transactions ────────────────────────────────────────────────────────────

export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, method, status, from, to, export: doExport } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { isPaid: true };
    if (method) query.paymentMethod = method;
    if (status) query.status = status;
    if (from || to) {
      query.paidAt = {};
      if (from) query.paidAt.$gte = new Date(from);
      if (to)   query.paidAt.$lte = new Date(to);
    }

    if (doExport === 'csv') {
      const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort({ paidAt: -1 })
        .lean();

      const rows = [
        ['Order #', 'Customer', 'Email', 'Amount (₹)', 'Payment Method', 'Razorpay Payment ID', 'Status', 'Paid At'].join(','),
        ...orders.map((o) => [
          o.orderNumber,
          `"${o.user?.name || ''}"`,
          o.user?.email || '',
          o.total,
          o.paymentMethod,
          o.paymentResult?.razorpayPaymentId || 'COD',
          o.status,
          o.paidAt ? new Date(o.paidAt).toISOString() : '',
        ].join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      return res.send(rows);
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ paidAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        transactions: orders,
        pagination: {
          total,
          page:       Number(page),
          limit:      Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getReports = async (req, res, next) => {
  try {
    const { from, to, export: doExport } = req.query;
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate   = to   ? new Date(to)   : new Date();
    toDate.setHours(23, 59, 59, 999);

    const dateMatch = { createdAt: { $gte: fromDate, $lte: toDate } };

    const [
      revenueByDay,
      ordersByStatus,
      topProducts,
      topCategories,
      revenueByMethod,
      newCustomers,
      overview,
    ] = await Promise.all([
      // Revenue per day in range
      Order.aggregate([
        { $match: { isPaid: true, ...dateMatch } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Orders by status
      Order.aggregate([
        { $match: dateMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Top 10 products by revenue
      Order.aggregate([
        { $match: { isPaid: true, ...dateMatch } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, unitsSold: { $sum: '$items.quantity' } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),

      // Revenue by product category (via product lookup)
      Order.aggregate([
        { $match: { isPaid: true, ...dateMatch } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } },
        { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$prod.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, unitsSold: { $sum: '$items.quantity' } } },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),

      // Revenue by payment method
      Order.aggregate([
        { $match: { isPaid: true, ...dateMatch } },
        { $group: { _id: '$paymentMethod', revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),

      // New customers per day
      User.aggregate([
        { $match: { role: 'customer', ...dateMatch } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Overview totals
      Order.aggregate([
        { $match: { ...dateMatch } },
        {
          $group: {
            _id: null,
            totalOrders:   { $sum: 1 },
            totalRevenue:  { $sum: { $cond: ['$isPaid', '$total', 0] } },
            totalDiscount: { $sum: '$discount' },
            avgOrderValue: { $avg: { $cond: ['$isPaid', '$total', null] } },
          },
        },
      ]),
    ]);

    if (doExport === 'csv') {
      const rows = [
        ['Date', 'Revenue (₹)', 'Orders'].join(','),
        ...revenueByDay.map((d) => [d._id, d.revenue.toFixed(2), d.orders].join(',')),
      ].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
      return res.send(rows);
    }

    const ov = overview[0] || {};

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalOrders:   ov.totalOrders   || 0,
          totalRevenue:  ov.totalRevenue  || 0,
          totalDiscount: ov.totalDiscount || 0,
          avgOrderValue: ov.avgOrderValue || 0,
        },
        revenueByDay,
        ordersByStatus: ordersByStatus.map((s) => ({ status: s._id, count: s.count })),
        topProducts,
        topCategories: topCategories.map((c) => ({ category: c._id || 'Uncategorized', revenue: c.revenue, unitsSold: c.unitsSold })),
        revenueByMethod: revenueByMethod.map((m) => ({ method: m._id, revenue: m.revenue, count: m.count })),
        newCustomers,
        period: { from: fromDate, to: toDate },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, resource, adminId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (resource) query.resource = resource;
    if (adminId)  query.adminId  = adminId;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        logs,
        pagination: {
          total,
          page:       Number(page),
          limit:      Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
