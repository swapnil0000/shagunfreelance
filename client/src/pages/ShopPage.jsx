import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import useProducts from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import SortDropdown from '../components/product/SortDropdown';

const CATEGORY_LABELS = {
  'shoulder-bags': 'Shoulder Bags',
  'tote-bags': 'Tote Bags',
  'laptop-bags': 'Laptop Bags',
  'crossbody-bags': 'Crossbody Bags',
  'handbags': 'Handbags',
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';

  const filters = {
    sort,
    page,
    limit: 12,
    ...(category && { category }),
  };

  const { data, isLoading } = useProducts(filters);
  const products = data?.products ?? [];
  const pagination = data?.pagination ?? { page: 1, pages: 0, total: 0 };

  const updateParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === '' || val === undefined || val === null) {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      return next;
    });
  };

  const handleSortChange = (value) => updateParams({ sort: value });

  return (
    <section className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-brand-50 via-white to-accent-50 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-1">
                Zimor India
              </p>
              <h1 className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
                {category ? (CATEGORY_LABELS[category] ?? 'Collection') : 'Our Collection'}
              </h1>
              <p className="mt-1.5 text-sm text-neutral-500 max-w-sm">
                Handcrafted bags designed for the modern woman. Find your perfect match.
              </p>
              {category && (
                <button
                  onClick={() => updateParams({ category: '', page: 1 })}
                  className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  {CATEGORY_LABELS[category] ?? category}
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <p className="text-sm text-neutral-400 shrink-0">
              {pagination.total > 0
                ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''}`
                : ''}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-end">
          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>

        {/* Product grid */}
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </section>
  );
}
