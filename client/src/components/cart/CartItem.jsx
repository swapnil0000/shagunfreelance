import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function CartItem({ item, onRemove, onUpdateQty }) {
  const { product, quantity, size, color } = item;
  const imageUrl = product.images?.[0]?.url || '/favicon.svg';
  const lineTotal = product.price * quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-neutral-100 last:border-0">
      {/* Product image */}
      <Link
        to={`/product/${product.slug}`}
        className="shrink-0"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg object-cover bg-neutral-100"
          loading="lazy"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/product/${product.slug}`}
              className="text-sm font-medium text-neutral-900 hover:text-brand-600 transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            {(size || color) && (
              <p className="text-xs text-neutral-500 mt-1">
                {size && <span>{size}</span>}
                {size && color && <span> / </span>}
                {color && <span>{color}</span>}
              </p>
            )}
            <p className="text-sm font-semibold text-brand-700 mt-1">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="p-1.5 text-neutral-400 hover:text-error transition-colors shrink-0"
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity controls + line total */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-neutral-200 rounded-lg">
            <button
              onClick={() => onUpdateQty(quantity - 1)}
              className="p-2 text-neutral-600 hover:text-brand-600 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 text-sm font-medium min-w-[32px] text-center tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQty(quantity + 1)}
              disabled={quantity >= product.stock}
              className="p-2 text-neutral-600 hover:text-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-sm font-semibold text-neutral-900 tabular-nums">
            ₹{lineTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
