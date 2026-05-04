import { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'shoulder-bags', label: 'Shoulder Bags' },
  { value: 'tote-bags', label: 'Tote Bags' },
  { value: 'laptop-bags', label: 'Laptop Bags' },
  { value: 'crossbody-bags', label: 'Crossbody Bags' },
  { value: 'handbags', label: 'Handbags' },
];

const PRICE_RANGES = [
  { label: 'Under ₹1,000', min: 0, max: 999 },
  { label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { label: 'Over ₹5,000', min: 5000, max: '' },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold text-neutral-800"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterContent({ category, minPrice, maxPrice, onFilterChange, onClear }) {
  const hasFilters = category || minPrice || maxPrice;

  const handleCategoryChange = (value) => {
    onFilterChange({ category: category === value ? '' : value });
  };

  const handlePriceChange = (range) => {
    const isActive =
      String(minPrice) === String(range.min) && String(maxPrice) === String(range.max);
    if (isActive) {
      onFilterChange({ minPrice: '', maxPrice: '' });
    } else {
      onFilterChange({ minPrice: range.min, maxPrice: range.max });
    }
  };

  return (
    <>
      {hasFilters && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Filters
          </span>
          <button
            onClick={onClear}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Clear all
          </button>
        </div>
      )}

      <FilterSection title="Category">
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-600 hover:text-neutral-900"
            >
              <input
                type="checkbox"
                checked={category === cat.value}
                onChange={() => handleCategoryChange(cat.value)}
                className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
              />
              {cat.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isActive =
              String(minPrice) === String(range.min) &&
              String(maxPrice) === String(range.max);
            return (
              <label
                key={range.label}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-600 hover:text-neutral-900"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={isActive}
                  onChange={() => handlePriceChange(range)}
                  className="h-4 w-4 border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
                {range.label}
              </label>
            );
          })}
        </div>
      </FilterSection>
    </>
  );
}

export default function FilterSidebar({ category, minPrice, maxPrice, onFilterChange, onClear }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile filter button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 lg:hidden"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-5 shadow-xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
              <FilterContent
                category={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onFilterChange={(f) => {
                  onFilterChange(f);
                  setMobileOpen(false);
                }}
                onClear={() => {
                  onClear();
                  setMobileOpen(false);
                }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <FilterContent
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onFilterChange={onFilterChange}
          onClear={onClear}
        />
      </aside>
    </>
  );
}
