import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ShoppingCart, IndianRupee, Users, Package,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

const statusVariantMap = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  shipped: 'info', delivered: 'success', cancelled: 'error',
};

const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
  shipped: '#06b6d4', delivered: '#10b981', cancelled: '#ef4444',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });
}

function StatCard({ icon: Icon, label, value, sub, trend, loading }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-neutral-500">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-7 w-24" />
        ) : (
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        )}
        {sub && !loading && (
          <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>
        )}
      </div>
    </div>
  );
}

const CustomTooltipRevenue = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-neutral-700 mb-1">{formatShortDate(label)}</p>
      <p className="text-brand-600">{formatCurrency(payload[0]?.value)}</p>
      <p className="text-neutral-500">{payload[1]?.value} orders</p>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: async () => {
      const res = await api.get('/orders?limit=10&sort=-createdAt');
      return res.data.data.orders || [];
    },
    staleTime: 60 * 1000,
  });

  const overview    = statsData?.overview    || {};
  const byStatus    = statsData?.ordersByStatus || [];
  const byDay       = statsData?.revenueByDay   || [];
  const topProducts = statsData?.topProducts    || [];
  const recentOrders = recentOrdersData || [];

  const pieData = byStatus.map((s) => ({
    name:  s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] || '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">Dashboard</h1>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={overview.totalOrders ?? '—'}
          sub={`+${overview.newOrdersThisWeek ?? 0} this week`}
          loading={isLoading}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={formatCurrency(overview.totalRevenue)}
          loading={isLoading}
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={overview.totalCustomers ?? '—'}
          sub={`+${overview.newCustomersThisWeek ?? 0} this week`}
          loading={isLoading}
        />
        <StatCard
          icon={Package}
          label="Active Products"
          value={overview.totalProducts ?? '—'}
          loading={isLoading}
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Revenue area chart (30 days) */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Revenue — Last 30 Days</h2>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : byDay.length === 0 ? (
            <p className="flex h-56 items-center justify-center text-sm text-neutral-400">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={byDay} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#000000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="_id"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false} tickLine={false}
                  width={48}
                />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Area
                  type="monotone" dataKey="revenue"
                  stroke="#000000" strokeWidth={2}
                  fill="url(#colorRevenue)"
                  dot={false} activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status pie */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Orders by Status</h2>
          {isLoading ? (
            <Skeleton className="h-56 w-full rounded-full" />
          ) : pieData.length === 0 ? (
            <p className="flex h-56 items-center justify-center text-sm text-neutral-400">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="45%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v, n]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span className="text-xs capitalize text-neutral-600">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Top Products bar chart ──────────────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Top Products by Revenue</h2>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : topProducts.length === 0 ? (
          <p className="text-sm text-neutral-400">No sales data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                type="category" dataKey="name"
                width={120}
                tick={{ fontSize: 10, fill: '#374151' }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v?.length > 18 ? v.slice(0, 18) + '…' : v}
              />
              <Tooltip
                formatter={(v) => [formatCurrency(v), 'Revenue']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="revenue" fill="#000000" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Recent Orders table ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-neutral-900">Recent Orders</h2>
        </div>

        {ordersLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-neutral-500">
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-neutral-900">
                      {order.orderNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-600">
                      {order.shippingAddress?.fullName || order.user?.name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge variant={statusVariantMap[order.status] || 'default'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
