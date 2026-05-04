import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
} from 'lucide-react';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

const statusVariantMap = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-neutral-500">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-20" />
          ) : (
            <p className="text-xl font-semibold text-neutral-900">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboard() {
  // Fetch orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
  } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.data.orders;
    },
  });

  // Fetch products
  const {
    data: productsData,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.data;
    },
  });

  const isLoading = ordersLoading || productsLoading;

  // Derive stats from fetched data
  const orders = ordersData || [];
  const totalOrders = orders.length;
  const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const uniqueCustomers = new Set(
    orders.map((order) => order.user?._id || order.user)
  ).size;
  const totalProducts = productsData?.products?.length ?? productsData?.pagination?.total ?? 0;

  // Recent orders (last 10)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">
        Dashboard
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={totalOrders}
          loading={isLoading}
        />
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={formatCurrency(revenue)}
          loading={isLoading}
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={uniqueCustomers}
          loading={isLoading}
        />
        <StatCard
          icon={Package}
          label="Products"
          value={totalProducts}
          loading={isLoading}
        />
      </div>

      {/* Recent orders table */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-semibold text-neutral-900">
            Recent Orders
          </h2>
        </div>

        {isLoading ? (
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
                      {order.shippingAddress?.fullName ||
                        order.user?.name ||
                        '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge
                        variant={statusVariantMap[order.status] || 'default'}
                      >
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
