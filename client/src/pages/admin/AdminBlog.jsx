import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, BookOpen, X, Eye, Search } from 'lucide-react';
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
  title: '', slug: '', excerpt: '', content: '', coverImage: '',
  category: 'General', tags: '', status: 'draft', publishedAt: '',
  metaTitle: '', metaDescription: '', ogImage: '',
};

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminBlog() {
  const { token } = useAuthStore();
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  // ─── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return apiFetch(`${API}/admin/articles?${params}`, token).then((d) => d.data);
    },
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const articles = data?.articles || [];
  const pagination = data?.pagination || {};

  const filtered = search
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          (a.category || '').toLowerCase().includes(search.toLowerCase()),
      )
    : articles;

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (body) => apiFetch(`${API}/admin/articles`, token, { method: 'POST', body }),
    onSuccess: () => { qc.invalidateQueries(['admin-articles']); toast.success('Article created'); closeModal(); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => apiFetch(`${API}/admin/articles/${id}`, token, { method: 'PUT', body }),
    onSuccess: () => { qc.invalidateQueries(['admin-articles']); toast.success('Article updated'); closeModal(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`${API}/admin/articles/${id}`, token, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries(['admin-articles']); toast.success('Article deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e.message),
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM);
    setModal({ mode: 'create' });
  }

  function openEdit(article) {
    setForm({
      title:           article.title,
      slug:            article.slug,
      excerpt:         article.excerpt || '',
      content:         article.content || '',
      coverImage:      article.coverImage || '',
      category:        article.category || 'General',
      tags:            (article.tags || []).join(', '),
      status:          article.status,
      publishedAt:     article.publishedAt ? article.publishedAt.slice(0, 16) : '',
      metaTitle:       article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      ogImage:         article.ogImage || '',
    });
    setModal({ mode: 'edit', article });
  }

  function closeModal() {
    setModal(null);
    setForm(EMPTY_FORM);
  }

  function set(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  function handleTitleChange(val) {
    setForm((prev) => ({ ...prev, title: val, slug: slugify(val) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    if (!body.publishedAt) delete body.publishedAt;
    if (modal.mode === 'create') {
      createMutation.mutate(body);
    } else {
      updateMutation.mutate({ id: modal.article._id, body });
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Blog Articles</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Write, edit and publish blog posts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New Article
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-lg border border-neutral-200 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'published', 'draft', 'scheduled'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <BookOpen className="mb-2 h-10 w-10" />
            <p>No articles found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Author</th>
                <th className="px-4 py-3 hidden lg:table-cell">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((article) => (
                <tr key={article._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {article.coverImage ? (
                        <img
                          src={article.coverImage}
                          alt=""
                          className="h-10 w-14 flex-shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded bg-neutral-100">
                          <BookOpen className="h-4 w-4 text-neutral-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-neutral-900 line-clamp-1">{article.title}</p>
                        <p className="text-xs text-neutral-400">/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-neutral-500">
                    {article.category || 'General'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[article.status]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-500">
                    {article.author?.name || '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-neutral-500">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {article.status === 'published' && (
                        <a
                          href={`/blog/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                          title="View article"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(article)}
                        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(article)}
                        className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
          <span>
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pagination.totalPages}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ─── Create / Edit Modal ─────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="relative my-8 w-full max-w-4xl rounded-xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                {modal.mode === 'create' ? 'New Article' : `Edit: ${modal.article.title}`}
              </h2>
              <button onClick={closeModal} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
              {/* Title + Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="My Awesome Article"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Slug</label>
                  <div className="flex items-center rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                    <span className="mr-1 shrink-0 text-neutral-400">/blog/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => set('slug', e.target.value)}
                      placeholder="my-awesome-article"
                      className="flex-1 min-w-0 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Excerpt</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => set('excerpt', e.target.value)}
                  placeholder="Short summary shown in article listings…"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Cover Image URL</label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => set('coverImage', e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                {form.coverImage && (
                  <img src={form.coverImage} alt="cover preview" className="mt-2 h-28 rounded object-cover" />
                )}
              </div>

              {/* Content */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-700">Content</label>
                <RichEditor
                  value={form.content}
                  onChange={(html) => set('content', html)}
                  placeholder="Start writing your article…"
                  minHeight={320}
                />
              </div>

              {/* Category + Tags + Status */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    placeholder="General"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => set('tags', e.target.value)}
                    placeholder="fashion, handbags, tips"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
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
              </div>

              {form.status === 'scheduled' && (
                <div className="max-w-xs">
                  <label className="mb-1 block text-xs font-medium text-neutral-700">Publish At</label>
                  <input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) => set('publishedAt', e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              )}

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
                      placeholder="SEO title"
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
                      placeholder="SEO description"
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
                  <BookOpen className="h-4 w-4" />
                  {saving ? 'Saving…' : modal.mode === 'create' ? 'Create Article' : 'Save Changes'}
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
            <h3 className="mb-2 font-semibold text-neutral-900">Delete Article?</h3>
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
