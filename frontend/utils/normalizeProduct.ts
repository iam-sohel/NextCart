/**
 * NEXTCART — Product normalization helpers.
 *
 * The mock data and the future backend may produce slightly different shapes
 * for the `images` field (string[] vs ProductImage[]) and for stock
 * information (flat integer vs structured inventory). These helpers project
 * both into the canonical Product shape the UI consumes.
 *
 * Once the mock data is removed these helpers can stay as defensive layers
 * or be removed entirely — leaving them in does no harm.
 */

import type {
  Product,
  ProductImage,
  ProductInventory,
  ProductVariant,
} from "@/types/product";

/**
 * Convert a backend product payload (or mock data) into the canonical
 * Product shape. Safe to call repeatedly — pure function.
 */
export function normalizeProduct(raw: Product): Product {
  const images = normalizeImages(raw.images, raw.image);
  const primaryImage =
    images.find((img) => img.isPrimary)?.url ?? images[0]?.url ?? raw.image;

  const inventory = normalizeInventory(raw.inventory, raw.stock);
  const variants = normalizeVariants(raw.variants);

  return {
    ...raw,
    image: primaryImage,
    images,
    inventory,
    stock: inventory.available,
    variants,
  };
}

function normalizeImages(
  images: ProductImage[] | string[] | undefined,
  fallback: string,
): ProductImage[] {
  if (!images || images.length === 0) {
    return fallback
      ? [{ id: "primary", url: fallback, isPrimary: true, sortOrder: 0 }]
      : [];
  }

  return images.map((img, index) => {
    if (typeof img === "string") {
      return {
        id: `img-${index}`,
        url: img,
        sortOrder: index,
        isPrimary: index === 0,
      };
    }
    return {
      ...img,
      sortOrder: img.sortOrder ?? index,
      isPrimary: img.isPrimary ?? index === 0,
    };
  });
}

function normalizeInventory(
  inventory: ProductInventory | undefined,
  stockFallback: number | undefined,
): ProductInventory {
  if (inventory) {
    const quantity = Number(inventory.quantity ?? 0);
    const reservedQty = Number(inventory.reservedQty ?? 0);
    const available =
      typeof inventory.available === "number"
        ? Math.max(0, inventory.available)
        : Math.max(0, quantity - reservedQty);
    return { quantity, reservedQty, available };
  }

  const quantity = Number(stockFallback ?? 0);
  return { quantity, reservedQty: 0, available: quantity };
}

function normalizeVariants(
  variants: ProductVariant[] | undefined,
): ProductVariant[] {
  if (!variants) return [];
  return variants.map((v) => ({
    ...v,
    price: typeof v.price === "number" ? v.price : undefined,
    inventory: v.inventory
      ? {
          quantity: Number(v.inventory.quantity ?? 0),
          reservedQty: Number(v.inventory.reservedQty ?? 0),
          available:
            typeof v.inventory.available === "number"
              ? Math.max(0, v.inventory.available)
              : Math.max(
                  0,
                  Number(v.inventory.quantity ?? 0) -
                    Number(v.inventory.reservedQty ?? 0),
                ),
        }
      : undefined,
  }));
}
