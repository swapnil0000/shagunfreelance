import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Globe, FileText, X, Eye } from 'lucide-react';
import RichEditor from '../../components/admin/RichEditor';
import useAuthStore from '../../stores/authStore';

const API = '/api/cms';

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
  published: 'bg-green-100 text-green-700',
  draft:     'bg-neutral-100 text-neutral-600',
  scheduled: 'bg-yellow-100 text-yellow-700',
};

const EMPTY_FORM = {
  slug: '', title: '', content: '', status: 'draft',
  metaTitle: '', metaDescription: '', ogImage: '', publishedAt: '',
};

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminCMS() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | { mode:'create'|'edit', page?:object }
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tab, setTab] = useState('all'); // 'all' | 'published' | 'draft'

  // ─── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: () => apiFetch(`${API}/admin/pages`, token).then((d) => d.data.pages),
    staleTime: 60_000,
  });

  const pages = (data || []).filter((p) => tab === 'all' || p.status === tab);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (body) => apiFetch(`${API}/admin/pages`, token, { method: 'POST', body }),
    onSuccess: () => { qc.invalidateQueries(['admin-pages']); toast.success('Page created'); closeModal(); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => apiFetch(`${API}/admin/pages/${id}`, token, { method: 'PUT', body }),
    onSuccess: () => { qc.invalidateQueries(['admin-pages']); toast.success('Page updated'); closeModal(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`${API}/admin/pages/${id}`, token, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries(['admin-pages']); toast.success('Page deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e.message),
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM);
    setModal({ mode: 'create' });
  }

  function openEdit(page) {
    setForm({
      slug:            page.slug,
      title:           page.title,
      content:         page.content || '',
      status:          page.status,
      metaTitle:       page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      ogImage:         page.ogImage || '',
      publishedAt:     page.publishedAt ? page.publishedAt.slice(0, 16) : '',
    });
    setModal({ mode: 'edit', page });
  }

  function closeModal() {
    setModal(null);
    setForm(EMPTY_FORM);
  }

  function set(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  function handleTitleChange(val) {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: modal?.page?.isSystem ? prev.slug : slugify(val),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const body = { ...form };
    if (!body.publishedAt) delete body.publishedAt;
    if (modal.mode === 'create') {
      createMutation.mutate(body);
    } else {
      updateMutation.mutate({ id: modal.page._id, body });
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">CMS Pages</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Manage static pages like About, Privacy Policy, Terms, etc.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New Page
        </button>
      </div>

      {/* Tab filter */}
      <div className="mb-4 flex gap-2">
        {['all', 'published', 'draft'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">Loading…</div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <FileText className="mb-2 h-10 w-10" />
            <p>No pages found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Title / Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Published</th>
                <th className="px-4 py-3 hidden lg:table-cell">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pages.map((page) => (
                <tr key={page._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{page.title}</p>
                    <p className="text-xs text-neutral-400">/{page.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[page.status]}`}>
                      {page.status}
                    </span>
                    {page.isSystem && (
                      <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">system</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-500">
                    {page.publishedAt ? new Date(page.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-500">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {page.status === 'published' && (
                        <a
                          href={`/pages/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                          title="View page"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(page)}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {!page.isSystem && (
                        <button
                          onClick={() => setDeleteTarget(page)}
                          className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Create / Edit Modal ─────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="relative my-8 w-full max-w-4xl rounded-xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                {modal.mode === 'create' ? 'New Page' : `Edit: ${modal.page.title}`}
              </h2>
              <button onClick={closeModal} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
              {/* Title + Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="About Us"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Slug</label>
                  <div className="flex items-center rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                    <span className="mr-1 text-neutral-400">/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => set('slug', e.target.value)}
                      disabled={modal.page?.isSystem}
                      placeholder="about-us"
                      className="flex-1 focus:outline-none disabled:text-neutral-400"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Content</label>
                <RichEditor
                  value={form.content}
                  onChange={(html) => set('content', html)}
                  placeholder="Write your page content here…"
                  minHeight={280}
                />
              </div>

              {/* Status + Published At */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => set('status', e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                {form.status === 'scheduled' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-700">Publish At</label>
                    <input
                      type="datetime-local"
                      value={form.publishedAt}
                      onChange={(e) => set('publishedAt', e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* SEO section */}
              <details className="rounded-lg border border-neutral-200">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                  SEO Settings
                </summary>
                <div className="space-y-3 border-t border-neutral-100 px-4 py-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-700">Meta Title</label>
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={(e) => set('metaTitle', e.target.value)}
                      maxLength={70}
                      placeholder="SEO title (60–70 chars)"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    <p className="mt-0.5 text-right text-xs text-neutral-400">{form.metaTitle.length}/70</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-700">Meta Description</label>
                    <textarea
                      rows={2}
                      value={form.metaDescription}
                      onChange={(e) => set('metaDescription', e.target.value)}
                      maxLength={160}
                      placeholder="SEO description (150–160 chars)"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
                    />
                    <p className="mt-0.5 text-right text-xs text-neutral-400">{form.metaDescription.length}/160</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-700">OG Image URL</label>
                    <input
                      type="url"
                      value={form.ogImage}
                      onChange={(e) => set('ogImage', e.target.value)}
                      placeholder="https://…"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </details>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  <Globe className="h-4 w-4" />
                  {saving ? 'Saving…' : modal.mode === 'create' ? 'Create Page' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ──────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 font-semibold text-neutral-900">Delete Page?</h3>
            <p className="text-sm text-neutral-500">
              <strong>{deleteTarget.title}</strong> will be permanently deleted.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget._id)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
