import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Ticket, ChevronDown, Send, X, Clock, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const API = '/api/tickets';

function apiFetch(url, token, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Request failed');
    return data;
  });
}

const STATUS_COLORS = {
  open:        'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-neutral-100 text-neutral-500',
};
const STATUS_ICONS = {
  open:        Circle,
  in_progress: Clock,
  resolved:    CheckCircle,
  closed:      X,
};
const PRIORITY_COLORS = {
  low:    'bg-neutral-100 text-neutral-500',
  medium: 'bg-blue-100 text-blue-600',
  high:   'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

export default function AdminTickets() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter, priorityFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter !== 'all')   params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      return apiFetch(`${API}?${params}`, token).then((d) => d.data);
    },
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const { data: ticketDetail } = useQuery({
    queryKey: ['admin-ticket', selected],
    queryFn: () => apiFetch(`${API}/${selected}`, token).then((d) => d.data.ticket),
    enabled: !!selected,
    staleTime: 10_000,
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, body, status }) => apiFetch(`${API}/${id}/reply`, token, { method: 'POST', body: { body, status } }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-ticket', selected]);
      qc.invalidateQueries(['admin-tickets']);
      setReply('');
      setNewStatus('');
      toast.success('Reply sent');
    },
    onError: (e) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, priority }) => apiFetch(`${API}/${id}/status`, token, { method: 'PATCH', body: { status, priority } }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-ticket', selected]);
      qc.invalidateQueries(['admin-tickets']);
      toast.success('Ticket updated');
    },
    onError: (e) => toast.error(e.message),
  });

  const tickets    = data?.tickets    || [];
  const pagination = data?.pagination || {};

  function handleReply() {
    if (!reply.trim() && !newStatus) return;
    replyMutation.mutate({ id: selected, body: reply.trim() || undefined, status: newStatus || undefined });
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* ─── Left: Ticket List ───────────────────────────────────────────────── */}
      <div className="flex w-96 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {/* Filters */}
        <div className="border-b border-neutral-100 p-3 space-y-2">
          <h1 className="text-sm font-semibold text-neutral-900">Support Tickets</h1>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="flex-1 rounded-lg border border-neutral-200 px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="flex-1 rounded-lg border border-neutral-200 px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Ticket items */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-neutral-400 text-sm">Loading…</div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <Ticket className="mb-2 h-8 w-8" />
              <p className="text-sm">No tickets</p>
            </div>
          ) : (
            tickets.map((t) => {
              const StatusIcon = STATUS_ICONS[t.status] || Circle;
              return (
                <button
                  key={t._id}
                  onClick={() => setSelected(t._id)}
                  className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
                    selected === t._id ? 'bg-brand-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">{t.subject}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{t.user?.name} — {t.ticketNumber}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${STATUS_COLORS[t.status]}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${PRIORITY_COLORS[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-neutral-400">{page} / {pagination.totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages}
              className="text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ─── Right: Ticket Detail ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center text-neutral-400">
            <Ticket className="mb-2 h-12 w-12" />
            <p>Select a ticket to view</p>
          </div>
        ) : !ticketDetail ? (
          <div className="flex flex-1 items-center justify-center text-neutral-400">Loading…</div>
        ) : (
          <>
            {/* Ticket header */}
            <div className="flex items-start justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-neutral-900">{ticketDetail.subject}</h2>
                  <span className="text-xs text-neutral-400">#{ticketDetail.ticketNumber}</span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {ticketDetail.user?.name} ({ticketDetail.user?.email}) — {ticketDetail.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  defaultValue={ticketDetail.priority}
                  onChange={(e) => statusMutation.mutate({ id: ticketDetail._id, priority: e.target.value })}
                  className="rounded border border-neutral-200 px-2 py-1 text-xs focus:outline-none"
                >
                  {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  defaultValue={ticketDetail.status}
                  onChange={(e) => statusMutation.mutate({ id: ticketDetail._id, status: e.target.value })}
                  className="rounded border border-neutral-200 px-2 py-1 text-xs focus:outline-none"
                >
                  {['open', 'in_progress', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {ticketDetail.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.senderRole === 'admin' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    msg.senderRole === 'admin' ? 'bg-brand-600' : 'bg-neutral-400'
                  }`}>
                    {(msg.sender?.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.senderRole === 'admin'
                      ? 'bg-brand-600 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                    <p className={`mt-1 text-[10px] ${msg.senderRole === 'admin' ? 'text-brand-200' : 'text-neutral-400'}`}>
                      {msg.sender?.name} · {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            {!['closed'].includes(ticketDetail.status) && (
              <div className="border-t border-neutral-200 p-4">
                <textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply…"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="">Keep current status</option>
                    <option value="in_progress">Mark In Progress</option>
                    <option value="resolved">Mark Resolved</option>
                    <option value="closed">Close Ticket</option>
                  </select>
                  <button
                    onClick={handleReply}
                    disabled={(!reply.trim() && !newStatus) || replyMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {replyMutation.isPending ? 'Sending…' : 'Send Reply'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
