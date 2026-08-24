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
 * server's `grandTotal`, not from client-side arithmetic.
 *
 * Line identity & the variantId gap:
 *   - The backend keys every cart line by VARIANT id. Adding requires a
 *     variantId (@NotNull); update/remove hit `/cart/items/{variantId}`.
 *   - BUT `CartItemResponseDTO` does NOT echo the variantId (nor slug /
 *     image) back. So after a fresh `GET /cart` we cannot, from the
 *     response alone, address a line for update/remove.
 *   - Workaround (frontend-only, no fabricated backend data): we key the
 *     view-model line by the server's cart-item ROW id (`wire.id`, which
 *     IS returned and IS stable across reloads) and retain a
 *     rowId → {variantId, slug, image, variantLabel} map. That map is
 *     mirrored to localStorage so update/remove and product links keep
 *     working after a reload. When a line has no known variantId (e.g.
 *     it was added on another device), mutations on it are safely blocked
 *     with a clear message instead of sending a wrong id.
 *   - The proper fix belongs in the backend: include variantId in
 *     CartItemResponseDTO. Documented as a backend dependency.
 *
 * Persistence:
 *   - Logged-in users: the server cart is the source of truth. The cart
 *     page calls `fetchCart()` on mount. A reload repopulates from the
 *     server; the localStorage meta map re-attaches variant/slug/image.
 *   - Guests: the cart is auth-only on the backend, so add entry points
 *     redirect guests to /login before calling the API.
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
   View-model (UI compatibility)
   ───────────────────────────────────────────────────────────────────── */

export interface CartItem {
  /** Cart-item ROW id from the server (unique per line; stable). */
  id: number | string;
  /** Backend product id (needed to re-add / as a fallback). */
  productId: number;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  /** Backend variant id — resolved from the retained meta map. */
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

  /** Hydrate from `GET /api/v1/cart`. */
  fetchCart: () => Promise<Result<CartItem[]>>;

  /** Add a variant. Requires `variantId`; guards & rejects if missing. */
  addToCart: (item: CartAddPayload) => Promise<Result<CartItem[]>>;

  /** Update a line's quantity. `rowId` is the cart-item row id. */
  updateQuantity: (
    rowId: number | string,
    quantity: number,
  ) => Promise<Result<CartItem[]>>;

  /** Delete one line by cart-item row id. */
  removeFromCart: (
    rowId: number | string,
  ) => Promise<Result<CartItem[]>>;

  /** Wipe server cart. */
  clearCart: () => Promise<Result<true>>;

  /** Reset local-only state when the user logs out. */
  reset: () => void;

  clearError: () => void;

  /* Shims kept so the existing Cart page keeps compiling. They delegate
     to the async actions. `options.variantId` (if provided) is used to
     seed the meta map when the line's variant isn't otherwise known. */
  increaseQuantity: (
    rowId: number | string,
    options?: { variantId?: string | number },
  ) => void;
  decreaseQuantity: (
    rowId: number | string,
    options?: { variantId?: string | number },
  ) => void;
  totalCount: () => number;
}

/* ─────────────────────────────────────────────────────────────────────
   Retained per-line meta (rowId → variant/visual), mirrored to storage.
   The backend response omits variantId/slug/image; this fills the gap.
   ───────────────────────────────────────────────────────────────────── */

interface LineMeta {
  productId?: number;
  variantId?: number;
  variantLabel?: string;
  slug?: string;
  title?: string;
  image?: string;
}

const META_STORAGE_KEY = "nextcart-cart-meta";

function toFiniteNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/* ─────────────────────────────────────────────────────────────────────
   Implementation
   ───────────────────────────────────────────────────────────────────── */

const useCartStore = create<CartStore>((set, get) => {
  // rowId(string) → LineMeta. Lazily loaded from localStorage on first
  // client-side use so the store factory stays SSR-safe.
  let metaByRowId = new Map<string, LineMeta>();
  let metaLoaded = false;

  function loadMeta(): Map<string, LineMeta> {
    if (typeof window === "undefined") return new Map();
    try {
      const raw = window.localStorage.getItem(META_STORAGE_KEY);
      if (!raw) return new Map();
      const parsed = JSON.parse(raw) as Record<string, LineMeta>;
      return new Map(Object.entries(parsed));
    } catch {
      return new Map();
    }
  }

  function saveMeta() {
    if (typeof window === "undefined") return;
    try {
      const obj: Record<string, LineMeta> = {};
      metaByRowId.forEach((v, k) => {
        obj[k] = v;
      });
      window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(obj));
    } catch {
      /* storage full / disabled — non-fatal, in-memory map still works */
    }
  }

  function ensureMeta() {
    if (!metaLoaded) {
      metaByRowId = loadMeta();
      metaLoaded = true;
    }
    return metaByRowId;
  }

  function mapWire(wire: CartResponseWire["items"][number]): CartItem {
    const meta = ensureMeta().get(String(wire.id));
    return {
      id: wire.id,
      productId: wire.productId,
      slug: meta?.slug ?? "",
      title: wire.productName || meta?.title || "",
      image: wire.productImage ?? meta?.image ?? "",
      price: wire.price,
      quantity: wire.quantity,
      variantId: meta?.variantId,
      variantLabel: meta?.variantLabel,
    };
  }

  function apply(response: CartResponseWire) {
    const items = response.items.map(mapWire);

    // Housekeeping: drop meta for rows no longer in the cart.
    const liveRowIds = new Set(response.items.map((w) => String(w.id)));
    let pruned = false;
    ensureMeta().forEach((_v, k) => {
      if (!liveRowIds.has(k)) {
        metaByRowId.delete(k);
        pruned = true;
      }
    });
    if (pruned) saveMeta();

    set({
      items,
      serverGrandTotal: response.grandTotal,
      serverTotalItems: response.totalItems,
      loading: false,
      error: null,
    });
    return { items, grandTotal: response.grandTotal, totalItems: response.totalItems };
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

      const productId = toFiniteNumber(item.id);
      if (productId === undefined) {
        return failWith("Invalid product id.");
      }

      const variantId = toFiniteNumber(item.variantId);
      if (variantId === undefined) {
        // The backend requires a variantId; don't fire a doomed request.
        return failWith(
          "Please select a variant before adding this item to your cart.",
        );
      }

      const quantity = Math.max(1, Math.floor(item.quantity || 1));

      // Snapshot existing rows so we can attribute a newly created row to
      // the variant we just added (the response doesn't echo variantId).
      const beforeRowIds = new Set(get().items.map((i) => String(i.id)));

      set({ loading: true });
      const res = await apiAddItem(productId, variantId, quantity);
      if (!res.ok) {
        return failWith(res.message);
      }

      ensureMeta();
      // New rows for this product created by the add → attach variant/meta.
      const newRowsForProduct = res.data.items.filter(
        (w) => !beforeRowIds.has(String(w.id)) && w.productId === productId,
      );
      const metaRecord: LineMeta = {
        productId,
        variantId,
        variantLabel: item.variantLabel,
        slug: item.slug,
        title: item.title,
        image: item.image,
      };
      if (newRowsForProduct.length === 1) {
        // Common case: exactly one new line → unambiguous.
        metaByRowId.set(String(newRowsForProduct[0].id), metaRecord);
      } else if (newRowsForProduct.length === 0) {
        // Existing variant → quantity bumped on a known row. Refresh its
        // meta (in case slug/image/label improved) for any row of this
        // product that we already track with the same variantId.
        res.data.items.forEach((w) => {
          if (w.productId !== productId) return;
          const existing = metaByRowId.get(String(w.id));
          if (existing && existing.variantId === variantId) {
            metaByRowId.set(String(w.id), { ...existing, ...metaRecord });
          }
        });
      }
      saveMeta();

      const mapped = apply(res.data);
      return { ok: true, data: mapped.items };
    },

    async updateQuantity(rowId, quantity) {
      set({ error: null });
      const line = get().items.find((i) => String(i.id) === String(rowId));
      const variantId = toFiniteNumber(line?.variantId);
      if (variantId === undefined) {
        return failWith(
          "We can't identify this item's variant, so its quantity can't be changed here. Please remove it and re-add it from the product page.",
        );
      }
      const safeQty = Math.max(1, Math.floor(quantity || 1));
      set({ loading: true });
      const res = await apiUpdateItem(variantId, safeQty);
      if (!res.ok) {
        return failWith(res.message);
      }
      const mapped = apply(res.data);
      return { ok: true, data: mapped.items };
    },

    async removeFromCart(rowId) {
      set({ error: null });
      const line = get().items.find((i) => String(i.id) === String(rowId));
      const variantId = toFiniteNumber(line?.variantId);
      if (variantId === undefined) {
        return failWith(
          "We can't identify this item's variant, so it can't be removed here. Please clear the cart or re-add it from the product page.",
        );
      }
      set({ loading: true });
      const res = await apiRemoveItem(variantId);
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
      ensureMeta().clear();
      saveMeta();
      set({
        items: [],
        serverGrandTotal: 0,
        serverTotalItems: 0,
      });
      return { ok: true, data: true };
    },

    reset() {
      ensureMeta().clear();
      saveMeta();
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

    // ── Shims (used by the cart page) ─────────────────────────────────
    increaseQuantity(rowId, options) {
      seedVariantFromOptions(rowId, options);
      const line = get().items.find((i) => String(i.id) === String(rowId));
      const next = (line?.quantity ?? 0) + 1;
      void get().updateQuantity(rowId, next);
    },
    decreaseQuantity(rowId, options) {
      seedVariantFromOptions(rowId, options);
      const line = get().items.find((i) => String(i.id) === String(rowId));
      const next = Math.max(1, (line?.quantity ?? 0) - 1);
      void get().updateQuantity(rowId, next);
    },
    totalCount() {
      return get().serverTotalItems || get().items.reduce((s, i) => s + i.quantity, 0);
    },
  };

  // If the caller (cart page) still knows a line's variantId, use it to
  // seed the meta map for lines we couldn't otherwise resolve.
  function seedVariantFromOptions(
    rowId: number | string,
    options?: { variantId?: string | number },
  ) {
    const optVariant = toFiniteNumber(options?.variantId);
    if (optVariant === undefined) return;
    const key = String(rowId);
    const meta = ensureMeta().get(key) ?? {};
    if (meta.variantId === optVariant) return;
    metaByRowId.set(key, { ...meta, variantId: optVariant });
    saveMeta();
    // Reflect the seeded variant on the in-memory line immediately.
    set({
      items: get().items.map((i) =>
        String(i.id) === key ? { ...i, variantId: optVariant } : i,
      ),
    });
  }
});

export default useCartStore;
