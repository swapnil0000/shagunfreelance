import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Mail, Phone, CheckCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/axios';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function MessageCard({ msg, onMarkRead }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border p-5 transition-colors ${msg.isRead ? 'border-neutral-200 bg-white' : 'border-brand-200 bg-brand-50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {!msg.isRead && (
              <span className="h-2 w-2 rounded-full bg-brand-600 shrink-0" />
            )}
            <p className="font-semibold text-neutral-900 truncate">{msg.name}</p>
            <Badge variant={msg.isRead ? 'default' : 'info'}>
              {msg.isRead ? 'Read' : 'Unread'}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 mb-2">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{msg.email}</span>
            {msg.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{msg.phone}</span>}
            <span>{formatDate(msg.createdAt)}</span>
          </div>

          <p className="text-sm font-medium text-neutral-700">{msg.subject}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!msg.isRead && (
            <button
              onClick={() => onMarkRead(msg._id)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Mark read
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 whitespace-pre-wrap border border-neutral-200">
          {msg.message}
        </div>
      )}
    </div>
  );
}

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // all | unread | read

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contacts'],
    queryFn:  async () => {
      const res = await api.get('/contact');
      return res.data.data.messages;
    },
    staleTime: 30 * 1000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => api.put(`/contact/${id}/read`),
    onSuccess: () => {
      toast.success('Marked as read');
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] });
    },
    onError: () => toast.error('Failed to update'),
  });

  const messages = data || [];
  const filtered = filter === 'unread'
    ? messages.filter((m) => !m.isRead)
    : filter === 'read'
    ? messages.filter((m) => m.isRead)
    : messages;

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-neutral-400" />
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">Contact Messages</h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white">
            {unreadCount} new
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        {[
          { key: 'all',    label: `All (${messages.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read',   label: 'Read' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              filter === key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Messages list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-neutral-400">
          <MessageSquare className="h-8 w-8" />
          <p className="text-sm">No messages in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <MessageCard
              key={msg._id}
              msg={msg}
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
