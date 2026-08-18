"use client";

import { create } from "zustand";

/**
 * NEXTCART — Wishlist store
 *
 * Single source of truth for saved-for-later items. Reused by:
 *   - ProductCard (top-right heart)
 *   - WishlistButton (product details page)
 *   - Wishlist page
 *
 * Backend migration plan:
 *   The shape mirrors what the eventual /api/wishlist endpoints will
 *   return. When persistence is wired, this store becomes a write-through
 *   cache of the server-side list.
 *
 * Variant preservation:
 *   A wishlist line carries the same variantId/variantLabel pair the cart
 *   does, so a "Move to cart" action keeps the user on the variant they
 *   saved. When variantId is absent the line refers to the parent product.
 */

export interface WishlistItem {
  id: number | string;
  title: string;
  image: string;
  price: number;
  slug: string;
  brand?: string;
  originalPrice?: number;
  /** Selected variant id (mirrors CartItem.variantId). */
  variantId?: string | number;
  /** Human-readable variant descriptor shown in the wishlist row. */
  variantLabel?: string;
}

interface WishlistStore {
  items: WishlistItem[];

  addToWishlist: (item: WishlistItem) => void;

  removeFromWishlist: (id: number) => void;

  /**
   * Remove a specific line. When `variantId` is provided only that
   * variant line is dropped; otherwise the entire product (all variants)
   * is removed.
   */
  removeFromWishlistLine: (
    id: number | string,
    options?: { variantId?: string | number },
  ) => void;

  isInWishlist: (id: number | string, options?: { variantId?: string | number }) => boolean;
}

function lineMatches(
  item: WishlistItem,
  id: number | string,
  variantId?: string | number,
): boolean {
  if (item.id !== id) return false;
  const itemVariantKey = item.variantId ?? "";
  const targetVariantKey = variantId ?? "";
  return itemVariantKey === targetVariantKey;
}

const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],

  addToWishlist: (item) => {
    const exists = get().items.find((p) =>
      lineMatches(p, item.id, item.variantId),
    );
    if (exists) return;
    set((state) => ({
      items: [...state.items, item],
    }));
  },

  removeFromWishlist: (id) => {
    set((state) => ({
      items: state.items.filter((p) => p.id !== id),
    }));
  },

  removeFromWishlistLine: (id, options) =>
    set((state) => ({
      items: state.items.filter(
        (item) => !lineMatches(item, id, options?.variantId),
      ),
    })),

  isInWishlist: (id, options) => {
    return get().items.some((p) => lineMatches(p, id, options?.variantId));
  },
}));

export default useWishlistStore;
