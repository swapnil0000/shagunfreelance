import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Package,
  User,
  ShoppingBag,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/axios';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const statusVariantMap = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

export default function AccountDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my-orders').then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  if (!isAuthenticated) return null;

  const recentOrders = ordersData?.orders?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-neutral-900 font-heading">
            My Account
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Welcome back, {user?.name || 'there'}!
          </p>
        </motion.div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/account/orders"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">Orders</p>
              <p className="text-xs text-neutral-500">
                {ordersData?.orders?.length ?? '—'} total
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            to="/account/profile"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">Profile</p>
              <p className="text-xs text-neutral-500">Edit your details</p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            to="/wishlist"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">Wishlist</p>
              <p className="text-xs text-neutral-500">Saved items</p>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Profile Summary
            </h2>
            <Link
              to="/account/profile"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Edit
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-neutral-500">Name</p>
              <p className="text-sm font-medium text-neutral-800">
                {user?.name || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Email</p>
              <p className="text-sm font-medium text-neutral-800">
                {user?.email || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Phone</p>
              <p className="text-sm font-medium text-neutral-800">
                {user?.phone || 'Not added'}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Addresses</p>
              <p className="text-sm font-medium text-neutral-800 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                {user?.addresses?.length
                  ? `${user.addresses.length} saved`
                  : 'None saved'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Recent Orders
            </h2>
            <Link
              to="/account/orders"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto h-10 w-10 text-neutral-300" />
              <p className="mt-2 text-sm text-neutral-500">No orders yet</p>
              <Link
                to="/shop"
                className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/account/orders/${order._id}`}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-neutral-50 -mx-2 px-2 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}
                      {order.items?.length}{' '}
                      {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariantMap[order.status] || 'default'}>
                      {order.status}
                    </Badge>
                    <span className="text-sm font-semibold text-neutral-900">
                      ₹{order.total?.toLocaleString('en-IN')}
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
