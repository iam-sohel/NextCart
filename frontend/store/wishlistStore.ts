"use client";

import { create } from "zustand";

interface WishlistItem {
  id: number;
  title: string;
  image: string;
  price: number;
  slug: string;
  brand?: string;
  originalPrice?: number;
}

interface WishlistStore {
  items: WishlistItem[];

  addToWishlist: (item: WishlistItem) => void;

  removeFromWishlist: (id: number) => void;

  isInWishlist: (id: number) => boolean;
}

const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],

  addToWishlist: (item) => {
    if (!get().items.find((p) => p.id === item.id)) {
      set((state) => ({
        items: [...state.items, item],
      }));
    }
  },

  removeFromWishlist: (id) => {
    set((state) => ({
      items: state.items.filter((p) => p.id !== id),
    }));
  },

  isInWishlist: (id) => {
    return get().items.some((p) => p.id === id);
  },
}));

export default useWishlistStore;