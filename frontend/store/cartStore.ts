import { create } from "zustand";

/**
 * NEXTCART — Cart store
 *
 * Single source of truth for cart items across the app. Reused by:
 *   - ProductCard (quick add from listings)
 *   - ProductDetailsClient (variant-aware add)
 *   - Cart page (line items, quantity controls, removal)
 *   - Wishlist page (move-to-cart)
 *   - Checkout (line items + totals)
 *
 * Backend migration plan:
 *   - Today: items live in memory. Each call mutates local state.
 *   - Phase 2: an effect will replay pending mutations against
 *     `POST /api/cart/items` and treat the server response as the new
 *     source of truth. The local store becomes a write-through cache.
 *
 * Line-identity rule:
 *   A line is identified by (id + variantId). Two clicks on the same
 *   product with different variants MUST result in two cart lines so the
 *   user can adjust them independently.
 *
 * Quantity rule:
 *   `addToCart` respects the requested quantity instead of forcing 1.
 *   The cart line is created with the requested quantity, and a second
 *   add of the same line increments by the requested amount (mirroring
 *   how most e-commerce carts work).
 *
 * De-duplication rule:
 *   Multiple callers used to simulate quantity by looping `addToCart`;
 *   the cart implementation now accepts `quantity` directly so callers
 *   stop needlessly rerendering.
 */

export interface CartItem {
  id: number | string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  /**
   * Selected variant id (e.g. "size-M-color-Red"). Optional — when
   * absent the line refers to the parent product. The backend will
   * need this when cart variants diverge from product variants.
   */
  variantId?: string | number;
  /** Human-readable variant descriptor shown in the cart / checkout. */
  variantLabel?: string;
}

export interface CartAddPayload {
  id: number | string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string | number;
  variantLabel?: string;
}

interface CartStore {
  items: CartItem[];

  addToCart: (item: CartAddPayload) => void;
  removeFromCart: (
    id: number | string,
    options?: { variantId?: string | number },
  ) => void;
  increaseQuantity: (
    id: number | string,
    options?: { variantId?: string | number },
  ) => void;
  decreaseQuantity: (
    id: number | string,
    options?: { variantId?: string | number },
  ) => void;
  /** Wipe the cart (e.g. after a successful checkout). */
  clearCart: () => void;
  /** Compute total units across every line (for the navbar badge). */
  totalCount: () => number;
}

/**
 * Build the predicate that identifies a cart line. Variants with the same
 * product id but different variant ids are distinct lines.
 */
function lineMatches(
  item: CartItem,
  id: number | string,
  variantId?: string | number,
): boolean {
  if (item.id !== id) return false;
  const itemVariantKey = item.variantId ?? "";
  const targetVariantKey = variantId ?? "";
  return itemVariantKey === targetVariantKey;
}

function normalizeVariantKey(
  variantId: string | number | undefined,
): string | number | undefined {
  if (variantId === undefined || variantId === null) return undefined;
  return variantId;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addToCart: (item) =>
    set((state) => {
      const requested = Math.max(1, Math.floor(item.quantity || 1));
      const variantKey = normalizeVariantKey(item.variantId);

      const existing = state.items.find((i) => lineMatches(i, item.id, variantKey));

      if (existing) {
        return {
          items: state.items.map((i) =>
            lineMatches(i, item.id, variantKey)
              ? { ...i, quantity: i.quantity + requested }
              : i,
          ),
        };
      }

      const newLine: CartItem = {
        id: item.id,
        slug: item.slug,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: requested,
        variantId: variantKey,
        variantLabel: item.variantLabel,
      };

      return { items: [...state.items, newLine] };
    }),

  removeFromCart: (id, options) =>
    set((state) => ({
      items: state.items.filter(
        (item) => !lineMatches(item, id, options?.variantId),
      ),
    })),

  increaseQuantity: (id, options) =>
    set((state) => ({
      items: state.items.map((item) =>
        lineMatches(item, id, options?.variantId)
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    })),

  decreaseQuantity: (id, options) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          lineMatches(item, id, options?.variantId)
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () => set({ items: [] }),

  totalCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

export default useCartStore;
