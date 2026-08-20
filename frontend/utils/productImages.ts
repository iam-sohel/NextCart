/**
 * NEXTCART — Product image registry.
 *
 * Single source of truth for product photos used in the mock catalogue.
 * Every product image rendered anywhere in the app should resolve through
 * `getProductImage()` so that:
 *
 *   1. We never reference a file that doesn't exist in /public.
 *   2. Missing images fall back to a real, on-disk placeholder rather than
 *      producing a 400 from next/image.
 *   3. When the real assets arrive (or the backend starts serving CDN
 *      URLs) we change one map, not every component.
 *
 * Convention: every key here is a public/ path that we have verified to
 * exist on disk. If you add a new entry, run a quick `ls` first.
 */

import type { Product } from "@/types/product";

/* ─────────────────────────────────────────────────────────────────────
   Real, on-disk product photos
   ───────────────────────────────────────────────────────────────────── */
export const PRODUCT_IMAGES = {
  /* Mobiles */
  iphone16: "/products/mobiles/iphone16.png",
  iphone16pro: "/products/mobiles/iphone16pro.png",
  s25ultra: "/products/mobiles/s25ultra.png",
  a56: "/products/mobiles/a56.png",
  sony: "/products/mobiles/sony.png", // generic mobile placeholder asset

  /* Laptops */
  macbook: "/products/laptops/macbook.png",
  dell: "/products/dell.png", // loose file at /products/dell.png

  /* Audio / Wearables */
  headphones: "/products/electronics/headphones.png",
  watch: "/products/electronics/watch.png",
  appleWatch: "/products/watch/AppleWatchSeries11.png",

  /* Televisions */
  tv: "/products/tv.png",

  /* Fashion */
  jeans: "/products/fashion/jeans.png",
  tshirt: "/products/tshirt.png",
  shoes: "/products/shoes.png",
  bag: "/products/bag.png",

  /* Cameras (used as a generic "tech" fallback when nothing else fits) */
  camera: "/products/camera.png",
} as const;

export type ProductImageKey = keyof typeof PRODUCT_IMAGES;

/* ─────────────────────────────────────────────────────────────────────
   Category fallbacks
   ───────────────────────────────────────────────────────────────────── */
export const CATEGORY_FALLBACK: Record<string, string> = {
  Mobiles: PRODUCT_IMAGES.iphone16,
  Laptops: PRODUCT_IMAGES.macbook,
  Tablets: PRODUCT_IMAGES.iphone16pro,
  Audio: PRODUCT_IMAGES.headphones,
  Televisions: PRODUCT_IMAGES.tv,
  "Home & Kitchen": PRODUCT_IMAGES.appleWatch,
  "Men's Fashion": PRODUCT_IMAGES.tshirt,
  "Women's Fashion": PRODUCT_IMAGES.jeans,
  Footwear: PRODUCT_IMAGES.shoes,
  "Beauty & Personal Care": PRODUCT_IMAGES.bag,
  Grocery: PRODUCT_IMAGES.bag,
  Gaming: PRODUCT_IMAGES.headphones,
  "Sports & Fitness": PRODUCT_IMAGES.shoes,
  Books: PRODUCT_IMAGES.bag,
  Kids: PRODUCT_IMAGES.bag,
  Appliances: PRODUCT_IMAGES.tv,
};

/**
 * Final universal fallback (the placeholder shipped with the project).
 * If even this file is missing, onError on <Image> will paint an empty
 * container — never a broken-image glyph.
 */
export const UNIVERSAL_FALLBACK = "/placeholders/product.png";

/* ─────────────────────────────────────────────────────────────────────
   Per-product overrides
   ───────────────────────────────────────────────────────────────────── */
/**
 * Map a product slug to a specific image. Used for the few products in
 * the catalogue that have a real branded asset on disk. The slug is
 * produced by `createProduct()` from the title, so the keys here MUST
 * match the slug output (lowercase, hyphens, no apostrophes).
 */
const SLUG_OVERRIDES: Record<string, string> = {
  "apple-iphone-16": PRODUCT_IMAGES.iphone16,
  "apple-iphone-16-pro": PRODUCT_IMAGES.iphone16pro,
  "samsung-galaxy-s25-ultra": PRODUCT_IMAGES.s25ultra,
  "samsung-galaxy-a56-5g": PRODUCT_IMAGES.a56,
  "samsung-55-inch-4k-smart-tv": PRODUCT_IMAGES.tv,
  "samsung-65-inch-neo-qled-tv": PRODUCT_IMAGES.tv,
  "lg-55-inch-oled-evo": PRODUCT_IMAGES.tv,
  "lg-65-inch-4k-uhd-smart-tv": PRODUCT_IMAGES.tv,
  "sony-bravia-55-inch-4k": PRODUCT_IMAGES.tv,
  "sony-bravia-65-inch-oled": PRODUCT_IMAGES.tv,
  "oneplus-55-inch-qled-tv": PRODUCT_IMAGES.tv,
  "tcl-55-inch-c-series-qled": PRODUCT_IMAGES.tv,
  "xiaomi-55-inch-x-pro": PRODUCT_IMAGES.tv,
  "vu-55-inch-masterpiece-tv": PRODUCT_IMAGES.tv,
  "fitness-smart-watch": PRODUCT_IMAGES.watch,
  "men-s-slim-fit-jeans": PRODUCT_IMAGES.jeans,
  "men-s-casual-chinos": PRODUCT_IMAGES.jeans,
  "women-s-straight-fit-jeans": PRODUCT_IMAGES.jeans,
};

/* ─────────────────────────────────────────────────────────────────────
   Public API
   ───────────────────────────────────────────────────────────────────── */

/**
 * Resolve the image URL for a Product. Order of preference:
 *   1. Explicit override by slug.
 *   2. The product's own `image` field, IF it is one of the known-good
 *      paths in PRODUCT_IMAGES (avoids the old broken /products/laptops/N.png).
 *   3. Category-level fallback from CATEGORY_FALLBACK.
 *   4. UNIVERSAL_FALLBACK.
 */
export function getProductImage(product: Pick<Product, "slug" | "image" | "category">): string {
  const override = SLUG_OVERRIDES[product.slug];
  if (override) return override;

  const known = (Object.values(PRODUCT_IMAGES) as readonly string[]).includes(
    product.image,
  );
  if (known) return product.image;

  const byCategory = CATEGORY_FALLBACK[product.category];
  if (byCategory) return byCategory;

  return UNIVERSAL_FALLBACK;
}

/** Get a category fallback directly (used by the product details page). */
export function getCategoryFallback(category: string): string {
  return CATEGORY_FALLBACK[category] ?? UNIVERSAL_FALLBACK;
}
