import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Edit2, X, RotateCcw, Send } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const API = '/api/admin/email-templates';

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

export default function AdminEmailTemplates() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // { template }
  const [form, setForm] = useState({ subject: '', body: '' });
  const [testEmail, setTestEmail] = useState('');
  const [testTemplateId, setTestTemplateId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => apiFetch(API, token).then((d) => d.data.templates),
    staleTime: 60_000,
  });

  const templates = data || [];

  // Load full template for editing
  const loadTemplate = async (tpl) => {
    const res = await apiFetch(`${API}/${tpl._id}`, token);
    const full = res.data.template;
    setForm({ subject: full.subject, body: full.body });
    setEditing(full);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => apiFetch(`${API}/${id}`, token, { method: 'PUT', body }),
    onSuccess: () => { qc.invalidateQueries(['email-templates']); toast.success('Template saved'); setEditing(null); },
    onError: (e) => toast.error(e.message),
  });

  const resetMutation = useMutation({
    mutationFn: (id) => apiFetch(`${API}/${id}/reset`, token, { method: 'POST' }),
    onSuccess: async (_, id) => {
      qc.invalidateQueries(['email-templates']);
      toast.success('Template reset to default');
      // Reload updated template in modal
      const res = await apiFetch(`${API}/${id}`, token);
      const full = res.data.template;
      setForm({ subject: full.subject, body: full.body });
      setEditing(full);
    },
    onError: (e) => toast.error(e.message),
  });

  const testMutation = useMutation({
    mutationFn: ({ id, to }) => apiFetch(`${API}/${id}/test`, token, { method: 'POST', body: { to } }),
    onSuccess: () => { toast.success(`Test email sent to ${testEmail}`); setTestTemplateId(null); setTestEmail(''); },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit(e) {
    e.preventDefault();
    updateMutation.mutate({ id: editing._id, body: { subject: form.subject, body: form.body } });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Email Templates</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Customize email templates sent to customers. Use <code className="rounded bg-neutral-100 px-1 text-xs">{'{{variable}}'}</code> placeholders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-neutral-400">Loading…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="rounded-xl border border-neutral-200 bg-white p-5 hover:shadow-sm transition-shadow"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <Mail className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{tpl.label}</p>
                  <p className="text-xs text-neutral-400">{tpl.name}</p>
                </div>
              </div>

              {tpl.variables?.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {tpl.variables.map((v) => (
                    <span key={v} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => loadTemplate(tpl)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => { setTestTemplateId(tpl._id); setTestEmail(''); }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Edit Modal ──────────────────────────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="relative my-8 w-full max-w-3xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{editing.label}</h2>
                <p className="text-xs text-neutral-400">Variables: {(editing.variables || []).map((v) => `{{${v}}}`).join(', ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => resetMutation.mutate(editing._id)}
                  disabled={resetMutation.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                  title="Reset to default"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button onClick={() => setEditing(null)} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">HTML Body</label>
                <textarea
                  rows={16}
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-y"
                />
              </div>

              {/* Live HTML preview */}
              <details className="rounded-lg border border-neutral-200">
                <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
                  Preview (rendered HTML)
                </summary>
                <div
                  className="prose prose-sm max-w-none border-t border-neutral-100 p-4"
                  dangerouslySetInnerHTML={{ __html: form.body }}
                />
              </details>

              <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" />
                  {updateMutation.isPending ? 'Saving…' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Send Test Modal ─────────────────────────────────────────────────── */}
      {testTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-1 font-semibold text-neutral-900">Send Test Email</h3>
            <p className="mb-4 text-sm text-neutral-500">Sends with sample placeholder values.</p>
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setTestTemplateId(null)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => testEmail && testMutation.mutate({ id: testTemplateId, to: testEmail })}
                disabled={!testEmail || testMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {testMutation.isPending ? 'Sending…' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
