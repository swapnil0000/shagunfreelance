import { create } from 'zustand';

const CART_KEY = 'zimor_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : { items: [], coupon: null };
  } catch {
    return { items: [], coupon: null };
  }
}

function persist(items, coupon) {
  localStorage.setItem(CART_KEY, JSON.stringify({ items, coupon }));
}

function calcDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.discountType === 'percentage') {
    const raw = (subtotal * coupon.discountValue) / 100;
    const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    return Math.min(Math.round(capped * 100) / 100, subtotal);
  }
  return Math.min(coupon.discountValue, subtotal);
}

// Recomputes all derived values from raw state.
// Must be spread into every set() return so Zustand stores them as real properties.
function computeDerived(items, coupon) {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discount = calcDiscount(coupon, subtotal);
  const total = subtotal - discount;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, discount, shipping: 0, total, totalItems };
}

const saved = loadCart();

const useCartStore = create((set, get) => ({
  items: saved.items,
  coupon: saved.coupon,
  isDrawerOpen: false,
  // Initialise derived values so they exist from the first render
  ...computeDerived(saved.items, saved.coupon),

  addItem: (product, quantity, size, color) => {
    if (quantity <= 0) return;
    set((state) => {
      const idx = state.items.findIndex(
        (i) => i.product._id === product._id && i.size === size && i.color === color
      );
      let items;
      if (idx >= 0) {
        items = state.items.map((item, i) =>
          i === idx
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        items = [
          ...state.items,
          { product, quantity: Math.min(quantity, product.stock), size, color },
        ];
      }
      persist(items, state.coupon);
      return { items, ...computeDerived(items, state.coupon) };
    });
  },

  removeItem: (productId, size, color) =>
    set((state) => {
      const items = state.items.filter(
        (i) => !(i.product._id === productId && i.size === size && i.color === color)
      );
      persist(items, state.coupon);
      return { items, ...computeDerived(items, state.coupon) };
    }),

  updateQuantity: (productId, size, color, qty) =>
    set((state) => {
      if (qty <= 0) {
        const items = state.items.filter(
          (i) => !(i.product._id === productId && i.size === size && i.color === color)
        );
        persist(items, state.coupon);
        return { items, ...computeDerived(items, state.coupon) };
      }
      const items = state.items.map((i) =>
        i.product._id === productId && i.size === size && i.color === color
          ? { ...i, quantity: Math.min(qty, i.product.stock) }
          : i
      );
      persist(items, state.coupon);
      return { items, ...computeDerived(items, state.coupon) };
    }),

  applyCoupon: (coupon) =>
    set((state) => {
      persist(state.items, coupon);
      return { coupon, ...computeDerived(state.items, coupon) };
    }),

  removeCoupon: () =>
    set((state) => {
      persist(state.items, null);
      return { coupon: null, ...computeDerived(state.items, null) };
    }),

  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    set({ items: [], coupon: null, ...computeDerived([], null) });
  },

  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));

export default useCartStore;
