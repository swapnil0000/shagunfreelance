import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_VARIANT = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  shipped: 'info', delivered: 'success', cancelled: 'error',
};

export default function AdminTransactions() {
  const [page, setPage]       = useState(1);
  const [method, setMethod]   = useState('');
  const [status, setStatus]   = useState('');
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [exporting, setExporting] = useState(false);
  const limit = 30;

  const buildParams = (extra = {}) => {
    const p = new URLSearchParams({ page, limit });
    if (method) p.append('method', method);
    if (status) p.append('status', status);
    if (from)   p.append('from', from);
    if (to)     p.append('to', to);
    Object.entries(extra).forEach(([k, v]) => p.append(k, v));
    return p.toString();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'transactions', method, status, from, to, page],
    queryFn:  async () => {
      const res = await api.get(`/admin/transactions?${buildParams()}`);
      return res.data.data;
    },
    staleTime: 30 * 1000,
  });

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const token   = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || '/api';
      const res     = await fetch(`${baseURL}/admin/transactions?${buildParams({ export: 'csv', limit: 10000 })}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const transactions = data?.transactions || [];
  const pagination   = data?.pagination   || {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-neutral-400" />
          <h1 className="font-heading text-2xl font-semibold text-neutral-900">Transactions</h1>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={method}
          onChange={(e) => { setMethod(e.target.value); setPage(1); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All methods</option>
          <option value="razorpay">Razorpay</option>
          <option value="cod">COD</option>
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <span className="text-neutral-400 text-sm">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {(method || status || from || to) && (
          <button
            onClick={() => { setMethod(''); setStatus(''); setFrom(''); setTo(''); setPage(1); }}
            className="text-sm text-neutral-400 hover:text-neutral-700 underline"
          >
            Clear filters
          </button>
        )}

        {pagination.total !== undefined && (
          <span className="ml-auto text-sm text-neutral-500">{pagination.total} transactions</span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-400">
            <CreditCard className="h-8 w-8" />
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-neutral-500">
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Payment ID</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Refund</th>
                  <th className="px-5 py-3 font-medium">Paid At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-neutral-900">{tx.orderNumber}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-neutral-900 truncate max-w-[120px]">{tx.user?.name || '—'}</p>
                      <p className="text-xs text-neutral-400 truncate max-w-[120px]">{tx.user?.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-neutral-900">
                      {formatCurrency(tx.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium uppercase text-neutral-600">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-400">
                      {tx.paymentResult?.razorpayPaymentId?.slice(-10) || 'COD'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge variant={STATUS_VARIANT[tx.status] || 'default'}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {tx.refund?.status === 'processed' ? (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                          ₹{tx.refund.amount}
                        </span>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-500">
                      {formatDate(tx.paidAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Page {pagination.page} of {pagination.totalPages}</span>
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
