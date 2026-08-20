/**
 * NEXTCART — Product normalization helpers.
 *
 * Two layers, kept separate so each has a single responsibility:
 *
 *   1. `normalizeBackendProduct(raw)` — adapts the Spring Boot DTO
 *      (name / images[].imageUrl / variants[].attributes / stockStatus)
 *      into the in-house `Product` shape. UI never imports this directly;
 *      the service layer (`productService.ts`) is the only caller.
 *
 *   2. `normalizeProduct(p)` — defensive in-house normalizer: accepts the
 *      legacy mock data shape (flat `stock` int, `string[]` images) and
 *      the post-adapter shape, and emits a single canonical `Product`.
 *
 * Once the mock data is removed these helpers can stay as defensive
 * layers or be removed entirely — leaving them in does no harm.
 */

import type {
  Product,
  ProductImage,
  ProductInventory,
  ProductVariant,
} from "@/types/product";
import { getProductImage } from "@/utils/productImages";
import { API_BASE_URL } from "@/lib/api";

/**
 * Turn a backend-supplied image URL into something `<Image>` can fetch.
 *
 * Rules:
 *   - Absolute URLs (http://, https://, //cdn…) pass through unchanged.
 *   - Root-relative paths ("/products/101/front.jpg") are absolutized
 *     against the configured API base so they resolve to the Spring
 *     Boot image endpoint, not the Next.js dev server.
 *   - Anything else is returned as-is — the placeholder registry will
 *     still kick in downstream.
 *
 * Centralizing this in one helper means the rest of the app never has
 * to know whether a URL came from the API or the mock dataset.
 */
export function absolutizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url)) return url;
  if (url.startsWith("/")) {
    const base = API_BASE_URL.replace(/\/+$/, "");
    return `${base}${url}`;
  }
  return url;
}

/* ─────────────────────────────────────────────────────────────────────
   Backend DTO → in-house Product adapter
   ───────────────────────────────────────────────────────────────────── */

/**
 * Subset of the Spring Boot DTO surface that the frontend actually
 * consumes. Documented in the backend contract:
 *
 *   ProductDto {
 *     id: number
 *     name: string                          // → title
 *     description?: string
 *     price: number
 *     originalPrice?: number
 *     discount?: number
 *     brand?: string
 *     category?: string
 *     images: { imageUrl: string, sortOrder?: number, isPrimary?: boolean }[]
 *     variants: {
 *       id: number | string
 *       sku?: string
 *       price?: number
 *       attributes: Record<string, string>  // Color/RAM/Storage/...
 *       inventory: {
 *         stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"
 *         quantity?: number
 *         reservedQty?: number
 *       }
 *     }[]
 *     rating?: number
 *     reviewsCount?: number
 *   }
 *
 * The fields are marked optional so unknown DTOs don't fail the adapter —
 * we degrade gracefully (e.g. fall back to a placeholder image).
 */
export interface BackendProductDto {
  id: number | string;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  brand?: string;
  category?: string;
  slug?: string;
  images?: Array<{
    imageUrl?: string;
    sortOrder?: number;
    isPrimary?: boolean;
  }>;
  variants?: Array<{
    id: number | string;
    sku?: string;
    price?: number;
    attributes?: Record<string, string | number | null>;
    inventory?: {
      stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | string;
      quantity?: number;
      reservedQty?: number;
    };
  }>;
  rating?: number;
  reviewsCount?: number;
}

/**
 * Map the backend DTO into the in-house `Product` shape. The result is
 * always run through `normalizeProduct()` so callers get the same
 * guarantees as for the in-house / mock path.
 */
export function normalizeBackendProduct(dto: BackendProductDto): Product {
  // ── Images ──────────────────────────────────────────────────────────
  const rawImages = Array.isArray(dto.images) ? dto.images : [];
  const mappedImages: ProductImage[] = [];
  rawImages.forEach((img, index) => {
    const url = absolutizeImageUrl(img.imageUrl);
    if (!url) return;
    mappedImages.push({
      id: `be-${dto.id}-${index}`,
      url,
      sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : index,
      isPrimary: img.isPrimary ?? index === 0,
    });
  });

  // ── Variants ────────────────────────────────────────────────────────
  const rawVariants = Array.isArray(dto.variants) ? dto.variants : [];
  const mappedVariants: ProductVariant[] = rawVariants.map((v) => {
    const attrs = v.attributes ?? {};
    // Map the well-known three axes into the existing typed fields so
    // ProductVariants.tsx (which only knows size/color/storage) keeps
    // working. Other axes travel through in the (typed-as-extra) shape
    // so future axes render without a code change.
    const inv = v.inventory;
    return {
      id: v.id,
      sku: v.sku,
      size: attrString(attrs, "size"),
      color: attrString(attrs, "color"),
      storage: attrString(attrs, "storage"),
      price: typeof v.price === "number" ? v.price : undefined,
      inventory: inv
        ? {
            quantity: Number(inv.quantity ?? 0),
            reservedQty: Number(inv.reservedQty ?? 0),
            available: Number(
              inv.quantity ?? 0 - Number(inv.reservedQty ?? 0),
            ),
          }
        : undefined,
    };
  });

  // Aggregate parent inventory: sum across variants. If the backend later
  // exposes a top-level `inventory` block on ProductDto, prefer that.
  const aggregateInventory: ProductInventory = (() => {
    if (mappedVariants.length === 0) {
      return { quantity: 0, reservedQty: 0, available: 0 };
    }
    let quantity = 0;
    let reservedQty = 0;
    for (const v of mappedVariants) {
      quantity += v.inventory?.quantity ?? 0;
      reservedQty += v.inventory?.reservedQty ?? 0;
    }
    return { quantity, reservedQty, available: quantity - reservedQty };
  })();

  // Derive a slug when the backend doesn't send one (defensive — most
  // DTOs will include it).
  const slug =
    dto.slug ||
    (typeof dto.name === "string"
      ? dto.name
          .toLowerCase()
          .replace(/['’]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : String(dto.id));

  const partial: Product = {
    id: dto.id,
    slug,
    title: dto.name ?? "",
    description: dto.description ?? "",
    brand: dto.brand ?? "",
    category: dto.category ?? "",
    // `image` and `images` are filled by the in-house normalizeProduct
    // via the getProductImage() registry; we still pass a sensible
    // primary so the registry has a starting point.
    image: mappedImages[0]?.url ?? "",
    images: mappedImages,
    price: Number(dto.price ?? 0),
    originalPrice:
      typeof dto.originalPrice === "number" ? dto.originalPrice : undefined,
    discount: typeof dto.discount === "number" ? dto.discount : undefined,
    rating: Number(dto.rating ?? 0),
    reviews: Number(dto.reviewsCount ?? 0),
    inventory: aggregateInventory,
    variants: mappedVariants,
  };

  return normalizeProduct(partial);
}

function attrString(
  attrs: Record<string, string | number | null | undefined>,
  key: string,
): string | null | undefined {
  if (!(key in attrs)) return undefined;
  const v = attrs[key];
  if (v === null) return null;
  if (v === undefined) return undefined;
  return String(v);
}

/**
 * Convert a backend product payload (or mock data) into the canonical
 * Product shape. Safe to call repeatedly — pure function.
 */
export function normalizeProduct(raw: Product): Product {
  // Resolve the primary image through the registry FIRST so that broken
  // mock paths (e.g. /products/laptops/6.png) never reach the optimizer.
  const resolvedPrimary = getProductImage(raw);
  const images = normalizeImages(raw.images, resolvedPrimary);
  const primaryImage =
    images.find((img) => img.isPrimary)?.url ?? images[0]?.url ?? resolvedPrimary;

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
