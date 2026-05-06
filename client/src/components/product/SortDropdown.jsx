import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 sm:px-4 sm:text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="hidden sm:inline">Sort: </span>{current.label}
        <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform sm:h-4 sm:w-4 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {SORT_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  value === option.value
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
