import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import useProducts from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import SortDropdown from '../components/product/SortDropdown';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const filters = {
    sort,
    page,
    limit: 12,
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
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-heading text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
              Our Collection
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-base text-neutral-500 sm:text-lg">
              Handcrafted bags designed for the modern woman. Find your perfect match.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Toolbar */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            {pagination.total > 0
              ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''}`
              : 'Browse our collection'}
          </p>
          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>

        {/* Product grid */}
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </section>
  );
}
