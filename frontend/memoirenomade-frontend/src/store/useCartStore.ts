import { create } from "zustand";
import { CartItem } from "@/types/booking.types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sessionId: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  hasSession: (sessionId: number) => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    // Regla: cada sesión solo puede aparecer una vez en el carrito
    const exists = get().items.some((i) => i.sessionId === item.sessionId);
    if (exists) return;
    set((state) => ({ items: [...state.items, item] }));
  },

  removeItem: (sessionId) => {
    set((state) => ({
      items: state.items.filter((i) => i.sessionId !== sessionId),
    }));
  },

  clearCart: () => set({ items: [] }),

  totalAmount: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  hasSession: (sessionId) => {
    return get().items.some((i) => i.sessionId === sessionId);
  },
}));
