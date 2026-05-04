import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState } from 'react';
import useProducts from '../hooks/useProducts';
import FilterSidebar from '../components/product/FilterSidebar';
import ProductGrid from '../components/product/ProductGrid';
import SortDropdown from '../components/product/SortDropdown';
import Pagination from '../components/product/Pagination';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;

  const filters = {
    ...(category && { category }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(search && { search }),
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
      // Reset to page 1 when filters change (unless page itself is being set)
      if (!('page' in updates)) next.delete('page');
      return next;
    });
  };

  const handleFilterChange = (filterUpdates) => {
    updateParams(filterUpdates);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      const s = prev.get('sort');
      if (s) next.set('sort', s);
      return next;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() });
  };

  const handleSortChange = (value) => {
    updateParams({ sort: value });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-900">Shop</h1>
        <p className="mt-1 text-neutral-500">
          {pagination.total > 0
            ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''}`
            : 'Browse our collection'}
        </p>
      </div>

      {/* Search + Sort + Mobile Filter row */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search bags..."
            className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
        </form>

        <div className="ml-auto">
          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-8">
        <FilterSidebar
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Product grid */}
        <div className="flex-1">
          <ProductGrid products={products} isLoading={isLoading} />
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </section>
  );
}
