/**
 * NEXTCART — Cart store (Zustand)
 *
 * Server-authoritative. The `items` array is derived from the backend's
 * `CartResponseDTO`; every mutation round-trips through Spring Boot
 * and the local items are replaced with whatever the server returns.
 *
 * The store keeps the existing `CartItem` view-model so the Cart and
 * Checkout pages keep rendering without any UI changes. The
 * `subtotal` / `total` numbers shown to the user are derived from the
 * server's `grandTotal`, not from client-side arithmetic — per the
 * Checkpoint 4 brief.
 *
 * Persistence:
 *   - For LOGGED-IN users: the server cart is the source of truth. The
 *     cart page calls `fetchCart()` on mount, which re-reads
 *     `GET /api/v1/cart`. A reload repopulates from the server.
 *   - For GUESTS: the local in-memory cart keeps working (the existing
 *     behaviour). Checkout requires authentication; guests are
 *     redirected to /login by the checkout page itself.
 *
 * Line identity:
 *   - On the wire the backend identifies lines by `productId` only
 *     (no variants yet). The local store keeps the `variantId` /
 *     `variantLabel` fields on each line for UI compatibility with
 *     product detail flows that pass them in.
 */

import { create } from "zustand";

import {
  addItemToCart as apiAddItem,
  clearServerCart as apiClearCart,
  getCart as apiGetCart,
  removeCartItem as apiRemoveItem,
  updateCartItem as apiUpdateItem,
  type CartResponseWire,
} from "@/services/cartService";

/* ─────────────────────────────────────────────────────────────────────
   View-model (unchanged shape — UI compatibility)
   ───────────────────────────────────────────────────────────────────── */

export interface CartItem {
  id: number | string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string | number;
  variantLabel?: string;
}

export interface CartAddPayload {
  id: number | string;
  slug?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string | number;
  variantLabel?: string;
}

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

interface CartStore {
  items: CartItem[];

  /** Backend-computed grand total. UI must read THIS, not local math. */
  serverGrandTotal: number;
  /** Backend-computed total units. */
  serverTotalItems: number;

  loading: boolean;
  error: string | null;

  /**
   * Hydrate from `GET /api/v1/cart`. Call on app / page mount for
   * authenticated users. Replaces local items with server response.
   */
  fetchCart: () => Promise<Result<CartItem[]>>;

  /**
   * Add an item. POSTs to the server and reconciles with the
   * authoritative response.
   */
  addToCart: (item: CartAddPayload) => Promise<Result<CartItem[]>>;

  /**
   * Update line quantity. PUT to the server, reconcile.
   */
  updateQuantity: (
    productId: number | string,
    quantity: number,
  ) => Promise<Result<CartItem[]>>;

  /** Delete one line. */
  removeFromCart: (
    productId: number | string,
  ) => Promise<Result<CartItem[]>>;

  /** Wipe server cart. */
  clearCart: () => Promise<Result<true>>;

  /** Reset local-only state when the user logs out. */
  reset: () => void;

  clearError: () => void;

  /* Deprecated shims — kept so the existing Cart page keeps compiling.
     They delegate to the new async actions but ignore the promise. */
  increaseQuantity: (
    id: number | string,
    options?: { variantId?: string | number },
  ) => void;
  decreaseQuantity: (
    id: number | string,
    options?: { variantId?: string | number },
  ) => void;
  totalCount: () => number;
}

/* ─────────────────────────────────────────────────────────────────────
   Mappers
   ───────────────────────────────────────────────────────────────────── */

function wireToView(
  wire: CartResponseWire["items"][number],
  fallback: Partial<CartAddPayload> = {},
): CartItem {
  return {
    id: wire.productId,
    slug: "",
    title: wire.productName,
    image: wire.productImage ?? "",
    price: wire.price,
    quantity: wire.quantity,
    variantId: fallback.variantId,
    variantLabel: fallback.variantLabel,
  };
}

function applyResponse(
  wire: CartResponseWire,
  fallbackByProductId: Map<string, Partial<CartAddPayload>> = new Map(),
): {
  items: CartItem[];
  grandTotal: number;
  totalItems: number;
} {
  return {
    items: wire.items.map((w) => wireToView(w, fallbackByProductId.get(String(w.productId)))),
    grandTotal: wire.grandTotal,
    totalItems: wire.totalItems,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Implementation
   ───────────────────────────────────────────────────────────────────── */

const useCartStore = create<CartStore>((set, get) => {
  // Cache the last "add" payload per product so that when the server
  // response comes back we can re-attach variantLabel / slug / image
  // for the lines we already saw locally. The cart page reads these
  // straight from the server response, so this is purely for visual
  // continuity.
  const lastAddPayloadByProductId = new Map<string, Partial<CartAddPayload>>();

  function rememberAddPayload(p: CartAddPayload) {
    lastAddPayloadByProductId.set(String(p.id), {
      slug: p.slug,
      title: p.title,
      image: p.image,
      variantId: p.variantId,
      variantLabel: p.variantLabel,
    });
  }

  function apply(response: CartResponseWire) {
    const mapped = applyResponse(response, lastAddPayloadByProductId);
    set({
      items: mapped.items,
      serverGrandTotal: mapped.grandTotal,
      serverTotalItems: mapped.totalItems,
      loading: false,
      error: null,
    });
    return mapped;
  }

  function failWith(message: string) {
    set({ loading: false, error: message });
    return { ok: false as const, message };
  }

  return {
    items: [],
    serverGrandTotal: 0,
    serverTotalItems: 0,
    loading: false,
    error: null,

    async fetchCart() {
      set({ loading: true, error: null });
      const res = await apiGetCart();
      if (!res.ok) {
        set({ loading: false, error: res.message });
        return { ok: false, message: res.message };
      }
      const mapped = apply(res.data);
      return { ok: true, data: mapped.items };
    },

    async addToCart(item) {
      set({ error: null });
      const numericId = Number(item.id);
      if (!Number.isFinite(numericId)) {
        return failWith("Invalid product id.");
      }
      rememberAddPayload(item);
      set({ loading: true });
      const res = await apiAddItem(numericId, Math.max(1, Math.floor(item.quantity || 1)));
      if (!res.ok) {
        return failWith(res.message);
      }
      const mapped = apply(res.data);
      return { ok: true, data: mapped.items };
    },

    async updateQuantity(productId, quantity) {
      set({ error: null });
      const numericId = Number(productId);
      if (!Number.isFinite(numericId)) {
        return failWith("Invalid product id.");
      }
      const safeQty = Math.max(1, Math.floor(quantity || 1));
      set({ loading: true });
      const res = await apiUpdateItem(numericId, safeQty);
      if (!res.ok) {
        return failWith(res.message);
      }
      const mapped = apply(res.data);
      return { ok: true, data: mapped.items };
    },

    async removeFromCart(productId) {
      set({ error: null });
      const numericId = Number(productId);
      if (!Number.isFinite(numericId)) {
        return failWith("Invalid product id.");
      }
      set({ loading: true });
      const res = await apiRemoveItem(numericId);
      if (!res.ok) {
        return failWith(res.message);
      }
      const mapped = apply(res.data);
      return { ok: true, data: mapped.items };
    },

    async clearCart() {
      set({ error: null });
      const res = await apiClearCart();
      if (!res.ok) {
        set({ error: res.message });
        return { ok: false, message: res.message };
      }
      set({
        items: [],
        serverGrandTotal: 0,
        serverTotalItems: 0,
      });
      return { ok: true, data: true };
    },

    reset() {
      lastAddPayloadByProductId.clear();
      set({
        items: [],
        serverGrandTotal: 0,
        serverTotalItems: 0,
        loading: false,
        error: null,
      });
    },

    clearError() {
      set({ error: null });
    },

    // ── Deprecated shims ──────────────────────────────────────────────
    increaseQuantity(id) {
      const line = get().items.find((i) => i.id === id);
      const next = (line?.quantity ?? 0) + 1;
      void get().updateQuantity(id, next);
    },
    decreaseQuantity(id) {
      const line = get().items.find((i) => i.id === id);
      const next = Math.max(1, (line?.quantity ?? 0) - 1);
      void get().updateQuantity(id, next);
    },
    totalCount() {
      // Prefer the server-provided value; fall back to local sum if the
      // store hasn't yet been hydrated for this session.
      return get().serverTotalItems || get().items.reduce((s, i) => s + i.quantity, 0);
    },
  };
});

export default useCartStore;
