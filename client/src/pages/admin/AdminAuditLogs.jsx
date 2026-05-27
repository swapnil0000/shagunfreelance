import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ACTION_COLORS = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-blue-50 text-blue-700',
  DELETE: 'bg-red-50 text-red-700',
  SUSPEND: 'bg-orange-50 text-orange-700',
};

function getActionColor(action) {
  const key = Object.keys(ACTION_COLORS).find((k) => action?.startsWith(k));
  return key ? ACTION_COLORS[key] : 'bg-neutral-100 text-neutral-600';
}

export default function AdminAuditLogs() {
  const [page, setPage]             = useState(1);
  const [resource, setResource]     = useState('');
  const limit = 30;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', resource, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      if (resource) params.append('resource', resource);
      const res = await api.get(`/admin/audit-logs?${params}`);
      return res.data.data;
    },
    staleTime: 30 * 1000,
  });

  const logs       = data?.logs       || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-neutral-400" />
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">Audit Logs</h1>
      </div>
      <p className="text-sm text-neutral-500">
        All admin actions are recorded here — product changes, order updates, customer management.
      </p>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={resource}
          onChange={(e) => { setResource(e.target.value); setPage(1); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All resources</option>
          <option value="product">Products</option>
          <option value="order">Orders</option>
          <option value="coupon">Coupons</option>
          <option value="customer">Customers</option>
          <option value="settings">Settings</option>
        </select>

        {pagination.total !== undefined && (
          <span className="ml-auto text-sm text-neutral-500">
            {pagination.total} log{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Log Table ────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-400">
            <ClipboardList className="h-8 w-8" />
            <p className="text-sm">No audit logs yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-neutral-500">
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Admin</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Resource</th>
                  <th className="px-5 py-3 font-medium">Resource ID</th>
                  <th className="px-5 py-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-500">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900">
                          {log.adminId?.name || 'Admin'}
                        </p>
                        <p className="truncate text-xs text-neutral-400">
                          {log.adminEmail}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 capitalize text-neutral-700">
                      {log.resource}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-neutral-400">
                      {log.resourceId ? log.resourceId.slice(-8) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-neutral-400">
                      {log.ip || '—'}
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
