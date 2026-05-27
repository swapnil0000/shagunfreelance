import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserX, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function AdminCustomers() {
  const queryClient = useQueryClient();
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]                   = useState(1);
  const [suspendedFilter, setSuspendedFilter] = useState('');
  const limit = 20;

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(window._customerSearchTimer);
    window._customerSearchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 350);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers', debouncedSearch, suspendedFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (suspendedFilter) params.append('suspended', suspendedFilter);
      const res = await api.get(`/admin/customers?${params}`);
      return res.data.data;
    },
    staleTime: 30 * 1000,
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/customers/${id}/suspend`),
    onSuccess: (res) => {
      const isSuspended = res.data.data.isSuspended;
      toast.success(isSuspended ? 'Customer suspended' : 'Customer reactivated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
    onError: () => toast.error('Action failed'),
  });

  const customers  = data?.customers  || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">Customers</h1>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <select
          value={suspendedFilter}
          onChange={(e) => { setSuspendedFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All customers</option>
          <option value="false">Active only</option>
          <option value="true">Suspended only</option>
        </select>

        {pagination.total !== undefined && (
          <span className="ml-auto text-sm text-neutral-500">
            {pagination.total} customer{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-400">
            <Search className="h-8 w-8" />
            <p className="text-sm">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-neutral-500">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Total Spent</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                          {customer.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-900">{customer.name}</p>
                          <p className="truncate text-xs text-neutral-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-600">
                      {customer.phone || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-neutral-900">
                      {customer.totalOrders}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge variant={customer.isSuspended ? 'error' : 'success'}>
                        {customer.isSuspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <button
                        onClick={() => suspendMutation.mutate(customer._id)}
                        disabled={suspendMutation.isPending}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          customer.isSuspended
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {customer.isSuspended ? (
                          <><UserCheck className="h-3.5 w-3.5" /> Reactivate</>
                        ) : (
                          <><UserX className="h-3.5 w-3.5" /> Suspend</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
