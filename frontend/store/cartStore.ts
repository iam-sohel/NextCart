import { create } from "zustand";

export interface CartItem {
  id: number;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];

  addToCart: (item: CartItem) => void;

  removeFromCart: (id: number) => void;

  increaseQuantity: (id: number) => void;

  decreaseQuantity: (id: number) => void;

  clearCart: () => void;
}

const useCartStore = create<CartStore>((set) => ({
  items: [],

  addToCart: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.id === item.id
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                }
              : i
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            ...item,
            quantity: 1,
          },
        ],
      };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      items: state.items.filter(
        (item) => item.id !== id
      ),
    })),

  increaseQuantity: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      ),
    })),

  decreaseQuantity: (id) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () =>
    set({
      items: [],
    }),
}));

export default useCartStore;