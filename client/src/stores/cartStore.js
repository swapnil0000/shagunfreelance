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

function persist(state) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify({ items: state.items, coupon: state.coupon })
  );
}

function calcDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.discountType === 'percentage') {
    const raw = (subtotal * coupon.discountValue) / 100;
    const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    return Math.min(Math.round(capped * 100) / 100, subtotal);
  }
  // fixed
  return Math.min(coupon.discountValue, subtotal);
}

const saved = loadCart();

const useCartStore = create((set, get) => ({
  items: saved.items,
  coupon: saved.coupon,
  isDrawerOpen: false,

  addItem: (product, quantity, size, color) => {
    if (quantity <= 0) return;
    set((state) => {
      const idx = state.items.findIndex(
        (i) =>
          i.product._id === product._id && i.size === size && i.color === color
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
      const next = { ...state, items };
      persist(next);
      return { items };
    });
  },

  removeItem: (productId, size, color) =>
    set((state) => {
      const items = state.items.filter(
        (i) =>
          !(i.product._id === productId && i.size === size && i.color === color)
      );
      const next = { ...state, items };
      persist(next);
      return { items };
    }),

  updateQuantity: (productId, size, color, qty) =>
    set((state) => {
      if (qty <= 0) {
        const items = state.items.filter(
          (i) =>
            !(i.product._id === productId && i.size === size && i.color === color)
        );
        const next = { ...state, items };
        persist(next);
        return { items };
      }
      const items = state.items.map((i) =>
        i.product._id === productId && i.size === size && i.color === color
          ? { ...i, quantity: Math.min(qty, i.product.stock) }
          : i
      );
      const next = { ...state, items };
      persist(next);
      return { items };
    }),

  applyCoupon: (coupon) =>
    set((state) => {
      const next = { ...state, coupon };
      persist(next);
      return { coupon };
    }),

  removeCoupon: () =>
    set((state) => {
      const next = { ...state, coupon: null };
      persist(next);
      return { coupon: null };
    }),

  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    set({ items: [], coupon: null });
  },

  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  // Computed getters
  get totalItems() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
  get subtotal() {
    return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  },
  get discount() {
    return calcDiscount(get().coupon, get().subtotal);
  },
  get shipping() {
    return 0;
  },
  get total() {
    return get().subtotal - get().discount;
  },
}));

export default useCartStore;
