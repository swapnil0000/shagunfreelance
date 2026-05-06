import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState } from 'react';
import useProducts from '../hooks/useProducts';
import FilterSidebar, { MobileFilterButton, MobileFilterDrawer } from '../components/product/FilterSidebar';
import ProductGrid from '../components/product/ProductGrid';
import SortDropdown from '../components/product/SortDropdown';
import Pagination from '../components/product/Pagination';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filterOpen, setFilterOpen] = useState(false);

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
      if (!('page' in updates)) next.delete('page');
      return next;
    });
  };

  const handleFilterChange = (filterUpdates) => updateParams(filterUpdates);

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

  const handleSortChange = (value) => updateParams({ sort: value });

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">Shop</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {pagination.total > 0
            ? `${pagination.total} product${pagination.total !== 1 ? 's' : ''}`
            : 'Browse our collection'}
        </p>
      </div>

      {/* Toolbar: Search + Filter button (mobile) + Sort */}
      <div className="mb-5 flex items-center gap-2 sm:gap-3">
        <form onSubmit={handleSearch} className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search bags..."
            className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 sm:py-2.5 sm:pl-10"
          />
        </form>
        <div className="flex items-center gap-2 ml-auto">
          <MobileFilterButton onClick={() => setFilterOpen(true)} />
          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Active filter chips (mobile) */}
      {(category || minPrice) && (
        <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
          {category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 capitalize">
              {category.replace(/-/g, ' ')}
              <button onClick={() => handleFilterChange({ category: '' })} aria-label="Remove">×</button>
            </span>
          )}
          {minPrice && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              ₹{minPrice}{maxPrice ? `–₹${maxPrice}` : '+'}
              <button onClick={() => handleFilterChange({ minPrice: '', maxPrice: '' })} aria-label="Remove">×</button>
            </span>
          )}
        </div>
      )}

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        category={category}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Main content: desktop sidebar + product grid */}
      <div className="flex gap-8">
        <FilterSidebar
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />
        <div className="min-w-0 flex-1">
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
