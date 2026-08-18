/**
 * NEXTCART — Domain types for products.
 *
 * These shapes intentionally mirror the Spring Boot DTOs the backend team
 * is building. They are NOT a 1:1 copy of the JPA entities — the entity
 * layer has internal fields (audit timestamps, soft-delete columns, etc.)
 * that the frontend should never see. Treat this file as the
 * frontend/backend contract surface: if the backend adds a field the UI
 * must display, add it here first.
 *
 * Convention:
 *   - IDs are numbers (matches the existing mock data and what most
 *     Spring Boot services return for IDENTITY columns).
 *   - All prices are numbers in RUPEES (not paise). When the backend
 *     switches to minor units we will add a "currency" field and a
 *     conversion helper — do NOT pre-empt that work here.
 *   - Optional fields use `?` so callers must handle absence. Never
 *     default a missing string to ""; treat absence as absence.
 *
 * BACKEND CONTRACT QUESTIONS (kept here so they are easy to grep for):
 *   - Are prices sent as numbers (number) or as strings (number)?
 *   - Does the product endpoint embed variants + inventory + reviews,
 *     or do we hit sub-resources? (Currently modelled as embedded
 *     for performance but documented as separable.)
 *   - Is the rating on the product the rolling average or the latest
 *     batch? Modelled as rolling average.
 */

// ─────────────────────────────────────────────────────────────────────
// Images
// ─────────────────────────────────────────────────────────────────────

/**
 * A product gallery image.
 * Backend model: product_images (id, product_id, image_url, sort_order, is_primary).
 */
export interface ProductImage {
  id: number | string;
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────────────

/**
 * A purchasable variant of a product. A variant is what gets added to the
 * cart — not the parent product. The parent product may not be directly
 * purchasable if it has at least one variant.
 *
 * Backend model: product_variants (id, product_id, sku, size, color, price, …).
 *
 * Free-form attributes (size/color/storage) are modelled as optional
 * strings because not every product uses every axis. The UI should only
 * show an axis that is non-null on at least one variant.
 */
export interface ProductVariant {
  id: number | string;
  sku?: string;
  size?: string | null;
  color?: string | null;
  storage?: string | null;
  /**
   * Dynamic attribute map as supplied by the backend. The
   * VariantSelector reads any axis (Color, RAM, Storage, Size, Material,
   * Capacity, Configuration, …) from this map without code changes.
   */
  attributes?: Record<string, string | number | null>;
  /** Variant-level price override in rupees. Falls back to the product price. */
  price?: number;
  /** Inventory for this variant. Optional — when omitted we use the parent's. */
  inventory?: {
    quantity?: number;
    reservedQty?: number;
    available?: number;
  };
  /**
   * Optional backend-provided inventory status. When present, takes
   * precedence over the local threshold-based derivation in
   * `deriveInventory()`.
   */
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | string;
}

// ─────────────────────────────────────────────────────────────────────
// Inventory summary (for the parent product when variants aren't loaded)
// ─────────────────────────────────────────────────────────────────────

export interface ProductInventory {
  quantity: number;
  reservedQty: number;
  available: number;
}

// ─────────────────────────────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────────────────────────────

/**
 * A single customer review.
 * Backend model: reviews (id, user_id, product_id, rating, comment, created_at).
 */
export interface Review {
  id: number | string;
  authorName?: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO timestamp from the backend
}

/**
 * Aggregated review metrics for a product. Sent alongside the review list
 * to avoid recomputing on the client.
 */
export interface ReviewSummary {
  average: number;
  count: number;
  /** Rating buckets (5 -> count of 5-star reviews). Optional — backend may omit. */
  distribution?: Record<1 | 2 | 3 | 4 | 5, number>;
}

// ─────────────────────────────────────────────────────────────────────
// The main Product
// ─────────────────────────────────────────────────────────────────────

/**
 * The product as returned by GET /api/products/{slug}.
 *
 * The shape is intentionally permissive: mock data and the real backend
 * may not return every field. Every consumer must tolerate missing
 * optional fields.
 */
export interface Product {
  id: number | string;
  slug: string;
  title: string;
  description: string;

  brand: string;
  category: string;
  categorySlug?: string;

  /** Primary image URL. Always present even when `images` is empty. */
  image: string;
  /** Gallery images. Empty array means "use `image` only". */
  images: ProductImage[];

  /** Current selling price in rupees. */
  price: number;
  /** Pre-discount price (MRP) in rupees. Optional — when absent we don't show a strike-through. */
  originalPrice?: number;
  /** Discount percentage. Optional — derive from price/originalPrice when absent. */
  discount?: number;

  rating: number;
  reviews: number;
  /** Detailed reviews when the backend includes them. */
  reviewsSummary?: ReviewSummary;
  reviewsList?: Review[];

  /**
   * Flat stock integer — kept for backwards compatibility with the
   * existing mock data. Prefer `inventory` for new code.
   */
  stock?: number;
  /** Structured inventory (preferred over `stock`). */
  inventory?: ProductInventory;
  /**
   * Optional backend-provided inventory status for the parent product
   * (when the backend doesn't return full variant inventory). When
   * present, takes precedence over the local threshold-based derivation
   * in `deriveInventory()`.
   */
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | string;

  /** Optional variants. When present with length > 0, the UI should render a VariantSelector. */
  variants?: ProductVariant[];

  /** Badge flags surfaced from the backend. */
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;

  /** Misc product facts the backend may include. */
  highlights?: string[];
  specifications?: Record<string, string>;
  keywords?: string[];
  color?: string;
  warranty?: string;
  delivery?: string;
}

/**
 * Lightweight shape used by product cards and carousels where the full
 * Product would be wasteful. Built from the full Product via
 * `toCardProduct()`.
 */
export interface CardProduct {
  id: number | string;
  slug: string;
  title: string;
  image: string;
  price: number | string;
  originalPrice?: number | string;
  offer: string;
  rating?: number;
  reviews?: number;
  brand?: string;
  bestseller?: boolean;
  newArrival?: boolean;
}

/** Convert a full Product into the smaller CardProduct shape. */
export function toCardProduct(product: Product): CardProduct {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    image: product.image,
    price: product.price,
    originalPrice: product.originalPrice,
    offer: product.discount ? `${product.discount}% OFF` : "Best Price",
    rating: product.rating,
    reviews: product.reviews,
    brand: product.brand,
    bestseller: product.bestseller,
    newArrival: product.newArrival,
  };
}
