import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Upload,
  X,
  Image,
  Loader2,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { cld } from '../../lib/cloudinary';

const CATEGORIES = [
  { value: 'shoulder-bags', label: 'Shoulder Bags' },
  { value: 'tote-bags', label: 'Tote Bags' },
  { value: 'laptop-bags', label: 'Laptop Bags' },
  { value: 'crossbody-bags', label: 'Crossbody Bags' },
  { value: 'handbags', label: 'Handbags' },
];

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: 'shoulder-bags',
  images: [],
  sizes: '',
  colors: [{ name: '', hex: '#000000' }],
  stock: '0',
  isFeatured: false,
  featuredOrder: '0',
  isActive: true,
  features: [],
  material: [],
  hardware: [],
  innerLining: [],
  careInstructions: [],
  dimensionLength: '',
  dimensionHeight: '',
  dimensionWidth: '',
  strapDrop: '',
  weight: '',
  keyHighlights: [],
  stylingGuide: [],
};

// Converts a field that may be a legacy string or an array to an array
const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'string') return [val];
  return [];
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await api.get('/products', { params });
      return res.data.data;
    },
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const createMutation = useMutation({
    mutationFn: (productData) => api.post('/products', productData),
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'featured'] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: productData }) => api.put(`/products/${id}`, productData),
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'featured'] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }) => api.put(`/products/${id}`, { isFeatured }),
    onSuccess: (_, { isFeatured }) => {
      toast.success(isFeatured ? 'Marked as featured' : 'Removed from featured');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'featured'] });
    },
    onError: () => toast.error('Failed to update featured status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    },
  });

  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(res.data.data);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, []);

  const removeImage = (index) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const setPrimaryImage = (index) => {
    if (index === 0) return;
    setForm((prev) => {
      const images = [...prev.images];
      const [selected] = images.splice(index, 1);
      return { ...prev, images: [selected, ...images] };
    });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      compareAtPrice: String(product.compareAtPrice || ''),
      category: product.category || 'shoulder-bags',
      images: product.images || [],
      sizes: (product.sizes || []).join(', '),
      colors: product.colors?.length > 0 ? product.colors : [{ name: '', hex: '#000000' }],
      stock: String(product.stock || '0'),
      isFeatured: product.isFeatured || false,
      featuredOrder: String(product.featuredOrder ?? 0),
      isActive: product.isActive !== false,
      features: toArray(product.features),
      material: toArray(product.material),
      hardware: toArray(product.hardware),
      innerLining: toArray(product.innerLining),
      careInstructions: toArray(product.careInstructions),
      dimensionLength: product.dimensionLength || '',
      dimensionHeight: product.dimensionHeight || '',
      dimensionWidth: product.dimensionWidth || '',
      strapDrop: product.strapDrop || '',
      weight: product.weight || '',
      keyHighlights: toArray(product.keyHighlights),
      stylingGuide: toArray(product.stylingGuide),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(INITIAL_FORM);
  };

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateColor = (index, field, value) =>
    setForm((prev) => {
      const colors = [...prev.colors];
      colors[index] = { ...colors[index], [field]: value };
      return { ...prev, colors };
    });
  const addColor = () =>
    setForm((prev) => ({ ...prev, colors: [...prev.colors, { name: '', hex: '#000000' }] }));
  const removeColor = (index) =>
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));

  // Generic helpers for any array field
  const addItem = (field) =>
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  const updateItem = (field, index, value) =>
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  const removeItem = (field, index) =>
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
      category: form.category,
      images: form.images,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.filter((c) => c.name.trim()),
      stock: parseInt(form.stock, 10) || 0,
      isFeatured: form.isFeatured,
      featuredOrder: parseInt(form.featuredOrder, 10) || 0,
      isActive: form.isActive,
      features: form.features.filter((f) => f.trim()),
      material: form.material.filter((m) => m.trim()),
      hardware: form.hardware.filter((h) => h.trim()),
      innerLining: form.innerLining.filter((l) => l.trim()),
      careInstructions: form.careInstructions.filter((c) => c.trim()),
      dimensionLength: form.dimensionLength.trim() || undefined,
      dimensionHeight: form.dimensionHeight.trim() || undefined,
      dimensionWidth: form.dimensionWidth.trim() || undefined,
      strapDrop: form.strapDrop.trim() || undefined,
      weight: form.weight.trim() || undefined,
      keyHighlights: form.keyHighlights.filter((h) => h.trim()),
      stylingGuide: form.stylingGuide.filter((s) => s.trim()),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">Products</h1>
        <Button onClick={openCreateModal} size="sm">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Image</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Name</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Category</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Price</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Stock</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Featured</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-10 w-10" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-6 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-20" /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    {product.images?.[0]?.url ? (
                      <img src={cld(product.images[0].url, { w: 80 })} alt={product.name} className="h-10 w-10 rounded-md object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100">
                        <Image className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">{product.name}</td>
                  <td className="px-4 py-3 capitalize text-neutral-600">
                    {product.category?.replace(/-/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-neutral-700">{product.stock}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFeaturedMutation.mutate({ id: product._id, isFeatured: !product.isFeatured })}
                      disabled={toggleFeaturedMutation.isPending}
                      title={product.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        product.isFeatured
                          ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                          : 'text-neutral-300 hover:bg-neutral-100 hover:text-neutral-700'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? 'success' : 'error'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(product)}
                        className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-brand-600 transition-colors"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product)}
                        className="rounded-md p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} products)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <ProductFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        form={form}
        updateField={updateField}
        updateColor={updateColor}
        addColor={addColor}
        removeColor={removeColor}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        setPrimaryImage={setPrimaryImage}
        handleSubmit={handleSubmit}
        uploading={uploading}
        isSaving={isSaving}
        isEditing={!!editingProduct}
        addItem={addItem}
        updateItem={updateItem}
        removeItem={removeItem}
      />

      <DeleteConfirmModal
        product={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteMutation.mutate(deleteConfirm._id)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}


// ─── Reusable dynamic bullet list ────────────────────────────────────────────

function BulletList({ label, hint, field, items, addItem, updateItem, removeItem, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      {hint && <p className="mb-2 text-xs text-neutral-500">{hint}</p>}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(field, idx, e.target.value)}
              placeholder={placeholder ? `${placeholder} ${idx + 1}` : `Point ${idx + 1}`}
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => removeItem(field, idx)}
              className="rounded-md p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
              aria-label={`Remove ${label} item`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addItem(field)}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          + Add {label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}


// ─── Product Form Modal ──────────────────────────────────────────────────────

function ProductFormModal({
  isOpen, onClose, form, updateField, updateColor, addColor, removeColor,
  handleImageUpload, removeImage, setPrimaryImage, handleSubmit,
  uploading, isSaving, isEditing, addItem, updateItem, removeItem,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 pb-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="relative w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="product-modal-title" className="font-heading text-xl font-semibold text-neutral-900">
                {isEditing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── Basic Information ── */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Basic Information</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Product Name"
                    name="name"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                    placeholder="e.g. Classic Leather Tote"
                  />
                  <div className="w-full">
                    <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-neutral-700">
                      Category
                    </label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Description <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Product description..."
                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </fieldset>

              {/* ── Pricing & Stock ── */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Pricing & Stock</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Price (₹)"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    required
                    placeholder="0"
                  />
                  <Input
                    label="Compare At Price (₹)"
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={(e) => updateField('compareAtPrice', e.target.value)}
                    placeholder="Optional"
                  />
                  <Input
                    label="Stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => updateField('stock', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </fieldset>

              {/* ── Images ── */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-neutral-700 mb-1">Images</legend>
                <p className="text-xs text-neutral-500">
                  First image is the <span className="font-medium text-brand-600">primary</span> image. Click the star to make any image primary.
                </p>
                <div className="flex flex-wrap gap-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.url}
                        alt={img.alt || `Product image ${idx + 1}`}
                        className={`h-20 w-20 rounded-lg object-cover border-2 transition-all ${
                          idx === 0 ? 'border-brand-500' : 'border-neutral-200'
                        }`}
                      />
                      {idx === 0 && (
                        <span className="absolute -top-2 -left-2 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                          PRIMARY
                        </span>
                      )}
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className="absolute -top-2 -left-2 rounded-full bg-white border border-neutral-300 p-0.5 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-brand-500 hover:border-brand-500 transition-all"
                          title="Set as primary"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label
                    className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-brand-500 hover:text-brand-600 transition-colors ${
                      uploading ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span className="mt-1 text-xs">Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </fieldset>

              {/* ── Variants ── */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Variants</legend>
                <Input
                  label="Sizes (comma-separated)"
                  name="sizes"
                  value={form.sizes}
                  onChange={(e) => updateField('sizes', e.target.value)}
                  placeholder="Small, Medium, Large"
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Colors</label>
                  <div className="space-y-2">
                    {form.colors.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={color.name}
                          onChange={(e) => updateColor(idx, 'name', e.target.value)}
                          placeholder="Color name"
                          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                          className="h-9 w-9 cursor-pointer rounded border border-neutral-300"
                          aria-label={`Color ${idx + 1} picker`}
                        />
                        {form.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeColor(idx)}
                            className="rounded-md p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addColor} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                      + Add color
                    </button>
                  </div>
                </div>
              </fieldset>

              {/* ── Product Features ── */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Product Features</legend>
                <BulletList
                  label="Feature"
                  hint='Each entry becomes a bullet point (e.g. "Spacious & Structured Design – Fits up to 14-inch laptop").'
                  field="features"
                  items={form.features}
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  placeholder="Feature"
                />
              </fieldset>

              {/* ── Materials & Care ── */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Materials & Care</legend>
                <BulletList
                  label="Material"
                  hint='Each entry is a bullet point (e.g. "Premium Canvas", "High-Quality Faux Leather").'
                  field="material"
                  items={form.material}
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  placeholder="Material"
                />
                <BulletList
                  label="Hardware"
                  hint='e.g. "Gold-tone metal accents"'
                  field="hardware"
                  items={form.hardware}
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  placeholder="Hardware"
                />
                <BulletList
                  label="Inner Lining"
                  hint='e.g. "Soft polyester fabric"'
                  field="innerLining"
                  items={form.innerLining}
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  placeholder="Inner lining"
                />
                <BulletList
                  label="Care Instruction"
                  hint='Each entry is a care bullet point (e.g. "Wipe with a soft, damp cloth").'
                  field="careInstructions"
                  items={form.careInstructions}
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  placeholder="Instruction"
                />
              </fieldset>

              {/* ── Dimensions ── */}
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Dimensions</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Length" name="dimensionLength" value={form.dimensionLength}
                    onChange={(e) => updateField('dimensionLength', e.target.value)} placeholder="e.g. 28 cm" />
                  <Input label="Height" name="dimensionHeight" value={form.dimensionHeight}
                    onChange={(e) => updateField('dimensionHeight', e.target.value)} placeholder="e.g. 20 cm" />
                  <Input label="Width" name="dimensionWidth" value={form.dimensionWidth}
                    onChange={(e) => updateField('dimensionWidth', e.target.value)} placeholder="e.g. 8 cm" />
                  <Input label="Strap Drop" name="strapDrop" value={form.strapDrop}
                    onChange={(e) => updateField('strapDrop', e.target.value)} placeholder="e.g. 24 cm" />
                  <Input label="Weight" name="weight" value={form.weight}
                    onChange={(e) => updateField('weight', e.target.value)} placeholder="e.g. Lightweight" />
                </div>
              </fieldset>

              {/* ── Key Highlights ── */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Key Highlights</legend>
                <BulletList
                  label="Highlight"
                  hint='Short, punchy selling points (e.g. "Elegant Classic Design", "Lightweight Daily Carry").'
                  field="keyHighlights"
                  items={form.keyHighlights}
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  placeholder="Highlight"
                />
              </fieldset>

              {/* ── Styling Guide ── */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Styling Guide</legend>
                <BulletList
                  label="Style tip"
                  hint='Each entry is a styling suggestion shown on the product page (e.g. "Work Ready – Pair with a blazer and trousers").'
                  field="stylingGuide"
                  items={form.stylingGuide}
                  addItem={addItem}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  placeholder="Style tip"
                />
              </fieldset>

              {/* ── Visibility ── */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-neutral-700 mb-2">Visibility</legend>
                <div className="flex flex-wrap items-end gap-6">
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => updateField('isFeatured', e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                    />
                    Featured Product
                  </label>
                  {form.isFeatured && (
                    <div className="w-32">
                      <label htmlFor="featuredOrder" className="mb-1 block text-xs font-medium text-neutral-600">
                        Featured Order
                      </label>
                      <input
                        id="featuredOrder"
                        type="number"
                        min="0"
                        value={form.featuredOrder}
                        onChange={(e) => updateField('featuredOrder', e.target.value)}
                        placeholder="1, 2, 3..."
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <p className="mt-1 text-[11px] text-neutral-400">
                        Lower = shown first on home (0 = end)
                      </p>
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => updateField('isActive', e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                    />
                    Active (visible to customers)
                  </label>
                </div>
              </fieldset>

              <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                <Button type="submit" size="sm" loading={isSaving}>
                  {isEditing ? 'Update Product' : 'Create Product'}
                </Button>
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────

function DeleteConfirmModal({ product, onClose, onConfirm, isDeleting }) {
  if (!product) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          aria-describedby="delete-desc"
          className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <h3 id="delete-title" className="text-lg font-semibold text-neutral-900">Deactivate Product</h3>
          <p id="delete-desc" className="mt-2 text-sm text-neutral-600">
            Are you sure you want to deactivate{' '}
            <span className="font-medium">{product.name}</span>? It will be hidden from customers but not permanently deleted.
          </p>
          <div className="mt-5 flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>Cancel</Button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Deactivate
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
