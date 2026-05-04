import { create } from 'zustand';

const WL_KEY = 'zimor_wishlist';

function loadItems() {
  try {
    const raw = localStorage.getItem(WL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const useWishlistStore = create((set, get) => ({
  items: loadItems(),

  addItem: (productId) =>
    set((state) => {
      if (state.items.includes(productId)) return state;
      const items = [...state.items, productId];
      localStorage.setItem(WL_KEY, JSON.stringify(items));
      return { items };
    }),

  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((id) => id !== productId);
      localStorage.setItem(WL_KEY, JSON.stringify(items));
      return { items };
    }),

  isInWishlist: (productId) => get().items.includes(productId),

  /**
   * Merge local wishlist with backend on login.
   * Accepts the backend items array and a callback to push merged list.
   */
  syncWithBackend: async (backendItems, pushFn) => {
    const local = get().items;
    const merged = [...new Set([...local, ...backendItems])];
    if (pushFn) await pushFn(merged);
    localStorage.removeItem(WL_KEY);
    set({ items: merged });
  },

  loadFromStorage: () => set({ items: loadItems() }),
}));

export default useWishlistStore;
