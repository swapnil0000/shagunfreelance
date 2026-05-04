import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Search } from 'lucide-react';
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

const ORDERS_PER_PAGE = 10;

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my-orders').then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  if (!isAuthenticated) return null;

  const allOrders = data?.orders || [];

  // Client-side search filter
  const filteredOrders = searchTerm
    ? allOrders.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allOrders;

  // Client-side pagination
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ORDERS_PER_PAGE,
    page * ORDERS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {allOrders.length} {allOrders.length === 1 ? 'order' : 'orders'}{' '}
              total
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </motion.div>

        {/* Orders List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : paginatedOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-neutral-200 bg-white py-16 text-center"
            >
              <Package className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-3 text-neutral-600">
                {searchTerm ? 'No orders match your search' : 'No orders yet'}
              </p>
              {!searchTerm && (
                <Link
                  to="/shop"
                  className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Start shopping →
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-3"
            >
              {paginatedOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/account/orders/${order._id}`}
                  className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900">
                        {order.orderNumber}
                      </p>
                      <Badge
                        variant={statusVariantMap[order.status] || 'default'}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}
                      {order.items?.length}{' '}
                      {order.items?.length === 1 ? 'item' : 'items'}
                      {order.paymentMethod && (
                        <>
                          {' · '}
                          {order.paymentMethod === 'cod'
                            ? 'Cash on Delivery'
                            : 'Razorpay'}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Price & arrow */}
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-neutral-900">
                      ₹{order.total?.toLocaleString('en-IN')}
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-brand-600 text-white'
                    : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
