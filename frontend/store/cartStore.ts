"use client";

import { create } from "zustand";
import {
  addItemToCart,
  clearServerCart,
  getCart,
  removeCartItem,
  updateCartItem,
  type CartResponseWire,
} from "@/services/cartService";

/* ─────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────── */

export interface CartItem {
  id: number | string;
  productId: number;

  slug: string;
  title: string;
  image: string;

  /** Backend unitPrice */
  price: number;

  quantity: number;

  /** Backend lineTotal */
  itemTotal: number;

  /** Backend productVariantId */
  variantId?: string | number;

  variantLabel?: string;
}

interface CartMeta {
  slug?: string;
  title?: string;
  image?: string;
  variantId?: string | number;
  variantLabel?: string;
}

interface AddToCartInput {
  productId: number | string;
  slug?: string;
  title?: string;
  image?: string;
  price?: number;
  quantity?: number;
  variantId?: string | number;
  variantLabel?: string;
}

interface CartStore {
  items: CartItem[];

  loading: boolean;
  error: string | null;

  /** Backend orderTotal */
  serverGrandTotal: number;

  /** Backend totalItems */
  serverTotalItems: number;

  addToCart: (input: AddToCartInput) => Promise<{
    ok: boolean;
    message?: string;
  }>;

  updateQuantity: (
    rowId: number | string,
    quantity: number,
  ) => Promise<{
    ok: boolean;
    message?: string;
  }>;

  removeFromCart: (
    rowId: number | string,
  ) => Promise<{
    ok: boolean;
    message?: string;
  }>;

  clearCart: () => Promise<void>;

  fetchCart: () => Promise<void>;

  clearError: () => void;

  /** Existing page compatibility */
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
   Constants
   ───────────────────────────────────────────────────────────────────── */

const META_STORAGE_KEY = "nextcart-cart-meta";

/* ─────────────────────────────────────────────────────────────────────
   Metadata helpers
   ───────────────────────────────────────────────────────────────────── */

function readMeta(): Record<string, CartMeta> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(
      META_STORAGE_KEY,
    );

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }
  } catch {
    // Ignore malformed local metadata.
  }

  return {};
}

function writeMeta(
  meta: Record<string, CartMeta>,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      META_STORAGE_KEY,
      JSON.stringify(meta),
    );
  } catch {
    // Ignore localStorage failures.
  }
}

function ensureMeta(): Map<string, CartMeta> {
  const raw = readMeta();

  return new Map(
    Object.entries(raw).map(
      ([key, value]) => [
        key,
        value ?? {},
      ],
    ),
  );
}

function saveItemMeta(
  cartItemId: number | string,
  meta: CartMeta,
) {
  const existing = readMeta();

  existing[String(cartItemId)] = {
    ...(existing[String(cartItemId)] ?? {}),
    ...meta,
  };

  writeMeta(existing);
}

function removeItemMeta(
  cartItemId: number | string,
) {
  const existing = readMeta();

  delete existing[String(cartItemId)];

  writeMeta(existing);
}

/* ─────────────────────────────────────────────────────────────────────
   Backend → Frontend mapping
   ───────────────────────────────────────────────────────────────────── */

function mapWire(
  wire: CartResponseWire["items"][number],
): CartItem {
  const meta = ensureMeta().get(
    String(wire.id),
  );

  const backendImage =
    typeof wire.productImage === "string"
      ? wire.productImage.trim()
      : "";

  const metadataImage =
    typeof meta?.image === "string"
      ? meta.image.trim()
      : "";

  return {
    id: wire.id,

    productId: wire.productId,

    slug: meta?.slug ?? "",

    title:
      wire.productName ||
      meta?.title ||
      "",

    /**
     * Image priority:
     *
     * 1. Backend cart image
     * 2. Real product image saved as cart metadata
     * 3. Empty string
     *
     * No mock/placeholder image is used.
     */
    image:
      backendImage ||
      metadataImage ||
      "",

    /** Backend unitPrice */
    price: wire.unitPrice,

    quantity: wire.quantity,

    /** Backend lineTotal */
    itemTotal: wire.lineTotal,

    /** Backend productVariantId */
    variantId:
      wire.productVariantId ??
      meta?.variantId,

    variantLabel:
      meta?.variantLabel,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Apply backend response
   ───────────────────────────────────────────────────────────────────── */

function apply(
  response: CartResponseWire,
  set: (
    partial:
      | Partial<CartStore>
      | ((
          state: CartStore,
        ) => Partial<CartStore>),
  ) => void,
) {
  const items =
    response.items.map(mapWire);

  /**
   * Backend cart contract:
   *
   * productPrice  = price before discount
   * totalDiscount = discount
   * orderTotal    = final payable amount
   */
  const grandTotal =
    response.orderTotal;

  const totalItems =
    response.totalItems;

  set({
    items,
    serverGrandTotal: grandTotal,
    serverTotalItems: totalItems,
    loading: false,
    error: null,
  });

  return {
    items,
    grandTotal,
    totalItems,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Zustand store
   ───────────────────────────────────────────────────────────────────── */

const useCartStore =
  create<CartStore>((set, get) => ({
    items: [],

    loading: false,

    error: null,

    serverGrandTotal: 0,

    serverTotalItems: 0,

    /* ───────────────────────────────────────────────────────────────
       Fetch cart
       ─────────────────────────────────────────────────────────────── */

    fetchCart: async () => {
      set({
        loading: true,
        error: null,
      });

      try {
        const result =
          await getCart();

        if (!result.ok) {
          const message =
            result.message ??
            "Failed to load cart.";

          set({
            loading: false,
            error: message,
          });

          return;
        }

        apply(
          result.data,
          set,
        );
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load cart.",
        });
      }
    },

    /* ───────────────────────────────────────────────────────────────
       Add to cart
       ─────────────────────────────────────────────────────────────── */

    addToCart: async (
      input,
    ) => {
      const quantity =
        Math.max(
          1,
          Number(
            input.quantity ?? 1,
          ),
        );

      const variantId =
        input.variantId !==
          undefined &&
        input.variantId !== null
          ? Number(
              input.variantId,
            )
          : undefined;

      if (
        variantId ===
          undefined ||
        !Number.isFinite(
          variantId,
        )
      ) {
        const message =
          "Please select a product variant before adding to cart.";

        set({
          loading: false,
          error: message,
        });

        return {
          ok: false,
          message,
        };
      }

      set({
        loading: true,
        error: null,
      });

      try {
        const result =
          await addItemToCart(
            Number(
              input.productId,
            ),
            variantId,
            quantity,
          );

        if (!result.ok) {
          const message =
            result.message ??
            "Failed to add item to cart.";

          set({
            loading: false,
            error: message,
          });

          return {
            ok: false,
            message,
          };
        }

        /**
         * Find the cart row returned by
         * the backend.
         */
        const returnedItem =
          result.data.items.find(
            (item) =>
              Number(
                item.productId,
              ) ===
                Number(
                  input.productId,
                ) &&
              Number(
                item.productVariantId,
              ) ===
                Number(
                  variantId,
                ),
          );

        /**
         * Save only real product metadata.
         *
         * No placeholder/mock image is
         * generated here.
         */
        if (returnedItem) {
          saveItemMeta(
            returnedItem.id,
            {
              slug: input.slug,
              title: input.title,

              ...(input.image?.trim()
                ? {
                    image:
                      input.image.trim(),
                  }
                : {}),

              variantId:
                returnedItem.productVariantId,

              variantLabel:
                input.variantLabel,
            },
          );
        }

        apply(
          result.data,
          set,
        );

        return {
          ok: true,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to add item to cart.";

        set({
          loading: false,
          error: message,
        });

        return {
          ok: false,
          message,
        };
      }
    },

    /* ───────────────────────────────────────────────────────────────
       Update quantity
       ─────────────────────────────────────────────────────────────── */

    updateQuantity: async (
      rowId,
      quantity,
    ) => {
      const safeQuantity =
        Math.max(
          1,
          Math.floor(
            Number(quantity),
          ),
        );

      const numericRowId =
        Number(rowId);

      if (
        !Number.isFinite(
          numericRowId,
        )
      ) {
        const message =
          "Invalid cart item ID.";

        set({
          loading: false,
          error: message,
        });

        return {
          ok: false,
          message,
        };
      }

      set({
        loading: true,
        error: null,
      });

      try {
        const result =
          await updateCartItem(
            numericRowId,
            safeQuantity,
          );

        if (!result.ok) {
          const message =
            result.message ??
            "Failed to update cart item.";

          set({
            loading: false,
            error: message,
          });

          return {
            ok: false,
            message,
          };
        }

        apply(
          result.data,
          set,
        );

        return {
          ok: true,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update cart item.";

        set({
          loading: false,
          error: message,
        });

        return {
          ok: false,
          message,
        };
      }
    },

    /* ───────────────────────────────────────────────────────────────
       Remove item
       ─────────────────────────────────────────────────────────────── */

    removeFromCart: async (
      rowId,
    ) => {
      const numericRowId =
        Number(rowId);

      if (
        !Number.isFinite(
          numericRowId,
        )
      ) {
        const message =
          "Invalid cart item ID.";

        set({
          loading: false,
          error: message,
        });

        return {
          ok: false,
          message,
        };
      }

      set({
        loading: true,
        error: null,
      });

      try {
        const result =
          await removeCartItem(
            numericRowId,
          );

        if (!result.ok) {
          const message =
            result.message ??
            "Failed to remove cart item.";

          set({
            loading: false,
            error: message,
          });

          return {
            ok: false,
            message,
          };
        }

        removeItemMeta(
          numericRowId,
        );

        apply(
          result.data,
          set,
        );

        return {
          ok: true,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to remove cart item.";

        set({
          loading: false,
          error: message,
        });

        return {
          ok: false,
          message,
        };
      }
    },

    /* ───────────────────────────────────────────────────────────────
       Clear cart
       ─────────────────────────────────────────────────────────────── */

    clearCart: async () => {
      set({
        loading: true,
        error: null,
      });

      try {
        const result =
          await clearServerCart();

        if (!result.ok) {
          const message =
            result.message ??
            "Failed to clear cart.";

          set({
            loading: false,
            error: message,
          });

          throw new Error(
            message,
          );
        }

        if (
          typeof window !==
          "undefined"
        ) {
          try {
            window.localStorage.removeItem(
              META_STORAGE_KEY,
            );
          } catch {
            // Ignore localStorage failures.
          }
        }

        set({
          items: [],
          serverGrandTotal: 0,
          serverTotalItems: 0,
          loading: false,
          error: null,
        });
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to clear cart.",
        });

        throw error;
      }
    },

    /* ───────────────────────────────────────────────────────────────
       Clear error
       ─────────────────────────────────────────────────────────────── */

    clearError: () => {
      set({
        error: null,
      });
    },

    /* ───────────────────────────────────────────────────────────────
       Increase quantity
       ─────────────────────────────────────────────────────────────── */

    increaseQuantity: (rowId) => {
      const line =
        get().items.find(
          (item) =>
            String(item.id) ===
            String(rowId),
        );

      const next =
        (line?.quantity ?? 0) + 1;

      void get().updateQuantity(
        rowId,
        next,
      );
    },

    /* ───────────────────────────────────────────────────────────────
       Decrease quantity
       ─────────────────────────────────────────────────────────────── */

    decreaseQuantity: (rowId) => {
      const line =
        get().items.find(
          (item) =>
            String(item.id) ===
            String(rowId),
        );

      const next =
        Math.max(
          1,
          (line?.quantity ?? 0) - 1,
        );

      void get().updateQuantity(
        rowId,
        next,
      );
    },

    /* ───────────────────────────────────────────────────────────────
       Total count
       ─────────────────────────────────────────────────────────────── */

    totalCount: () => {
      return (
        get().serverTotalItems ||
        get().items.reduce(
          (sum, item) =>
            sum + item.quantity,
          0,
        )
      );
    },
  }));

/* ─────────────────────────────────────────────────────────────────────
   Default export
   ───────────────────────────────────────────────────────────────────── */

export default useCartStore;