import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingCart, MessageSquare, Star, Settings, X, CheckCheck } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const TYPE_ICONS = {
  order:   ShoppingCart,
  contact: MessageSquare,
  review:  Star,
  system:  Settings,
};

function apiFetch(url, token, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  });
}

export default function NotificationBell() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => apiFetch('/api/admin/notifications', token).then((d) => d.data),
    refetchInterval: 30_000, // poll every 30 s
    staleTime: 20_000,
  });

  const notifications = data?.notifications || [];
  const unreadCount   = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: (ids) => apiFetch('/api/admin/notifications/read', token, { method: 'PATCH', body: { ids } }),
    onSuccess: () => qc.invalidateQueries(['admin-notifications']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/api/admin/notifications/${id}`, token, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries(['admin-notifications']),
  });

  function handleOpen() {
    setOpen((prev) => !prev);
    // Mark all unread as read when opening
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (unreadIds.length > 0 && !open) markReadMutation.mutate(unreadIds);
  }

  function handleClick(n) {
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <span className="text-sm font-semibold text-neutral-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markReadMutation.mutate([])}
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                <Bell className="mb-2 h-8 w-8" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Settings;
                return (
                  <div
                    key={n._id}
                    className={`group flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 ${
                      !n.isRead ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleClick(n)}
                      className="flex flex-1 items-start gap-3 text-left"
                    >
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        n.type === 'order'   ? 'bg-green-100 text-green-600' :
                        n.type === 'contact' ? 'bg-blue-100 text-blue-600' :
                        n.type === 'review'  ? 'bg-yellow-100 text-yellow-600' :
                                               'bg-neutral-100 text-neutral-500'
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-900">{n.title}</p>
                        {n.message && <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{n.message}</p>}
                        <p className="mt-0.5 text-[10px] text-neutral-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n._id); }}
                      className="mt-0.5 hidden rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-red-500 group-hover:block"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
