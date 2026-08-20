/**
 * NEXTCART — Wishlist store (Zustand)
 *
 * Single source of truth for saved-for-later items. The store mirrors
 * the backend's `WishlistResponseDTO` array directly so the UI never
 * has to translate wire shapes. Reused by:
 *
 *   - ProductCard (top-right heart)
 *   - WishlistButton (product details page)
 *   - Wishlist page
 *   - Navbar (badge count)
 *
 * Behavior contract:
 *   - `items` always reflects the backend's authoritative list.
 *   - `add(productId)` and `remove(productId)` perform OPTIMISTIC updates:
 *     local state mutates synchronously so the heart flips instantly,
 *     and the server response reconciles (or rolls back) on completion.
 *   - `has(productId)` is the canonical membership check, per the
 *     integration brief: `wishlist.some(item => item.productId === product.id)`.
 *   - The deprecated `isInWishlist` / `addToWishlist(item)` / etc.
 *     helpers remain as thin shims so existing components keep
 *     compiling while the migration lands.
 *
 * Auth gate:
 *   - Mutations MUST be called only when authenticated. The UI
 *     components enforce this; the store itself does not redirect.
 *     On 401 the global auth interceptor clears state and navigates.
 */

"use client";

import { create } from "zustand";

import {
  addToWishlist as apiAdd,
  clearWishlist as apiClear,
  listWishlist as apiList,
  removeFromWishlist as apiRemove,
  type WishlistResponseDTO,
} from "@/services/wishlistService";

/* ─────────────────────────────────────────────────────────────────────
   View-model
   ───────────────────────────────────────────────────────────────────── */

/**
 * UI-facing wishlist item. The backend never returns `slug`, `brand`,
 * `originalPrice`, `variantId`, or `variantLabel` — those stay optional
 * and are populated by product-detail fetchers added in later
 * checkpoints. The wishlist page is tolerant of their absence.
 */
export interface WishlistItem {
  /** Stable identity for React keys and the wishlist line itself. */
  wishlistId: number;
  /** Product id used by `has()`. */
  productId: number;
  title: string;
  image: string;
  price: number;
  slug?: string;
  brand?: string;
  originalPrice?: number;
  variantId?: string | number;
  variantLabel?: string;
  addedAt: string;
}

function toView(dto: WishlistResponseDTO): WishlistItem {
  return {
    wishlistId: dto.wishlistId,
    productId: dto.productId,
    title: dto.productName,
    image: dto.imageUrl ?? "",
    price: typeof dto.price === "number" ? dto.price : 0,
    addedAt: dto.addedAt,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Store contract
   ───────────────────────────────────────────────────────────────────── */

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

interface WishlistStore {
  /** Authoritative list of wishlist items, mirrored from the backend. */
  items: WishlistItem[];

  /** True while a list/add/remove is in-flight. */
  loading: boolean;
  /** Most recent error message; cleared by `clearError()`. */
  error: string | null;

  /** Initial fetch — call once when entering a screen that needs the list. */
  fetchAll: () => Promise<Result<WishlistItem[]>>;

  /**
   * Add a product to the wishlist. Optimistically inserts a placeholder
   * line (no `wishlistId` yet) and replaces it with the server's DTO
   * on success, or removes it on failure.
   */
  add: (productId: number | string) => Promise<Result<WishlistItem>>;

  /**
   * Remove a product by product id. Optimistic — drops the line first,
   * restores from server snapshot on failure.
   */
  remove: (productId: number | string) => Promise<Result<null>>;

  /** Wipe the entire wishlist. */
  clear: () => Promise<Result<null>>;

  /** Canonical membership check used by heart buttons. */
  has: (productId: number | string) => boolean;

  /** Reset error message after the UI has shown it. */
  clearError: () => void;

  /* ────────────────────────────────────────────────────────────────
     Deprecated shims — kept so existing components compile. New code
     should use `add`, `remove`, and `has` directly.
     ──────────────────────────────────────────────────────────────── */

  /** @deprecated Use `add` instead. */
  addToWishlist: (item: Partial<WishlistItem> & { id: number | string }) => void;

  /** @deprecated Use `remove` instead. */
  removeFromWishlist: (id: number | string) => void;

  /** @deprecated Use `remove` with options. */
  removeFromWishlistLine: (
    id: number | string,
    options?: { variantId?: string | number },
  ) => void;

  /** @deprecated Use `has` instead. */
  isInWishlist: (
    id: number | string,
    options?: { variantId?: string | number },
  ) => boolean;
}

/* ─────────────────────────────────────────────────────────────────────
   Optimistic helpers
   ───────────────────────────────────────────────────────────────────── */

function upsertByProductId(
  items: WishlistItem[],
  next: WishlistItem,
): WishlistItem[] {
  const idx = items.findIndex((i) => i.productId === next.productId);
  if (idx === -1) return [...items, next];
  const copy = items.slice();
  copy[idx] = next;
  return copy;
}

function removeByProductId(
  items: WishlistItem[],
  productId: number | string,
): WishlistItem[] {
  return items.filter((i) => i.productId !== Number(productId));
}

/* ─────────────────────────────────────────────────────────────────────
   Implementation
   ───────────────────────────────────────────────────────────────────── */

const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null });
    const res = await apiList();
    if (!res.ok) {
      set({ loading: false, error: res.message });
      return { ok: false, message: res.message };
    }
    const items = res.data.map(toView);
    set({ items, loading: false, error: null });
    return { ok: true, data: items };
  },

  async add(productId) {
    const numericId = Number(productId);
    const previous = get().items;
    // Optimistic insert. No wishlistId yet; the server response will
    // overwrite it on success.
    const placeholder: WishlistItem = {
      wishlistId: -Date.now(),
      productId: numericId,
      title: "",
      image: "",
      price: 0,
      addedAt: new Date().toISOString(),
    };
    if (!previous.some((i) => i.productId === numericId)) {
      set({ items: [...previous, placeholder], error: null });
    }

    const res = await apiAdd(numericId);
    if (!res.ok) {
      // Rollback on failure.
      set({ items: previous, error: res.message });
      return { ok: false, message: res.message };
    }
    const view = toView(res.data);
    set((state) => ({
      items: upsertByProductId(state.items, view),
      error: null,
    }));
    return { ok: true, data: view };
  },

  async remove(productId) {
    const numericId = Number(productId);
    const previous = get().items;
    set({
      items: removeByProductId(previous, numericId),
      error: null,
    });

    const res = await apiRemove(numericId);
    if (!res.ok) {
      // Rollback.
      set({ items: previous, error: res.message });
      return { ok: false, message: res.message };
    }
    return { ok: true, data: null };
  },

  async clear() {
    const previous = get().items;
    set({ items: [], error: null });

    const res = await apiClear();
    if (!res.ok) {
      set({ items: previous, error: res.message });
      return { ok: false, message: res.message };
    }
    return { ok: true, data: null };
  },

  has(productId) {
    const numericId = Number(productId);
    return get().items.some((item) => item.productId === numericId);
  },

  clearError() {
    set({ error: null });
  },

  // ── Deprecated shims ────────────────────────────────────────────────
  addToWishlist(item) {
    // Map legacy full-item add into a productId add. If callers still
    // pass `id`, treat it as the product id. If they pass `productId`
    // explicitly, prefer that.
    const productId =
      typeof item.productId === "number" ? item.productId : Number(item.id);
    void get().add(productId);
  },

  removeFromWishlist(id) {
    void get().remove(id);
  },

  removeFromWishlistLine(id) {
    void get().remove(id);
  },

  isInWishlist(id) {
    return get().has(id);
  },
}));

export default useWishlistStore;
