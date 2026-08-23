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
 * consumes. The current Spring Boot `ProductResponse` DTO does NOT
 * carry price, images, variants, inventory, ratings or reviews — those
 * live on the `ProductDetailsResponse` returned by
 * `GET /api/v1/products/{id}/details` (see `BackendProductDetailsDto`
 * below). This shape models a generic "product-like" backend payload
 * with all the fields any of the existing endpoint variants may
 * include, so the normalizer can stay defensive.
 */
export interface BackendProductDto {
  id: number | string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  brand?: string;
  brandName?: string;
  category?: string;
  categoryName?: string;
  subCategoryName?: string;
  status?: string | null;
  rating?: number;
  reviewsCount?: number;
  // Optional embedded blocks. The current top-level catalogue
  // endpoint does not include these — they are populated by the
  // /details endpoint instead. Kept here so the same normalizer
  // works against either shape.
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
}

/**
 * The actual `ProductDetailsResponse` payload served by the Spring Boot
 * backend at `GET /api/v1/products/{id}/details`.
 *
 *   ProductDetailsResponse {
 *     product: ProductResponse  // id, name, slug, description, brand/category names, status
 *     information?: {
 *       shortDescription?, longDescription?, warranty?, manufacturer?
 *     }
 *     specifications: { id, productId, specificationName, specificationValue }[]
 *     variants: {
 *       id, productId, sku, price, attributes: Record<string,string>, status
 *     }[]
 *     images: { id, productId, imageUrl, isPrimary, displayOrder }[]
 *   }
 *
 * NOTE: This endpoint does NOT yet include inventory (stockStatus/
 * quantity). Per-variant inventory is fetched separately from
 * `GET /api/v1/inventory/variant/{variantId}` and is merged in by the
 * service layer when present.
 */
export interface BackendProductDetailsDto {
  product?: BackendProductDto;
  information?: {
    id?: number | string;
    productId?: number | string;
    shortDescription?: string;
    longDescription?: string;
    warranty?: string;
    manufacturer?: string;
  };
  specifications?: Array<{
    id?: number | string;
    productId?: number | string;
    specificationName?: string;
    specificationValue?: string;
  }>;
  variants?: Array<{
    id: number | string;
    productId?: number | string;
    sku?: string;
    price?: number | string;
    attributes?: Record<string, string>;
    status?: string;
  }>;
  images?: Array<{
    id?: number | string;
    productId?: number | string;
    imageUrl?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  }>;
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
            // Guard operator precedence: `??` binds looser than `-`, so the
            // previous `inv.quantity ?? 0 - Number(...)` computed the wrong
            // number. Compute available explicitly and clamp at 0.
            available: Math.max(
              0,
              Number(inv.quantity ?? 0) - Number(inv.reservedQty ?? 0),
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
    // The Spring Boot catalogue/search DTO (`ProductResponse`) carries
    // `brandName` / `categoryName`, NOT `brand` / `category`. Mirror the
    // details adapter so the catalogue, card brand label, search filters
    // and same-category "related products" all resolve against the real API.
    brand: dto.brandName?.trim() || dto.brand?.trim() || "",
    category: dto.categoryName?.trim() || dto.category?.trim() || "",
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

/* ─────────────────────────────────────────────────────────────────────
   Backend ProductDetailsResponse → in-house Product adapter
   ───────────────────────────────────────────────────────────────────── */

/**
 * Map a `ProductDetailsResponse` payload (served by
 * `GET /api/v1/products/{id}/details`) plus a pre-fetched base
 * `ProductResponse` (so we don't lose any fields that only live on
 * `product`) into the in-house `Product` shape.
 *
 * What this merges:
 *   - product: id, name, slug, description, status, brand/category names
 *   - information.longDescription / shortDescription → product.description
 *   - information.warranty / manufacturer → product.warranty / brand
 *   - images[] → product.images (primary first, ordered by displayOrder)
 *   - variants[] → product.variants (attributes map preserved verbatim)
 *   - specifications[] → product.specifications (Record<string,string>)
 *
 * What this does NOT fabricate:
 *   - Price, originalPrice, discount, rating, reviewsCount, stock/inventory.
 *     Those are absent from the current DTO surface — the
 *     `InventoryResponse` is fetched per variant by the service layer
 *     and merged in. We never invent prices.
 */
export function normalizeBackendProductDetails(
  details: BackendProductDetailsDto | null | undefined,
  base: BackendProductDto | null | undefined,
): Product {
  const baseProduct = base ?? details?.product ?? ({} as BackendProductDto);
  const productId = baseProduct.id ?? details?.product?.id ?? "";

  // ── Images ──────────────────────────────────────────────────────────
  const rawImages = Array.isArray(details?.images) ? details!.images! : [];
  const mappedImages: ProductImage[] = rawImages
    .map((img, index): ProductImage | null => {
      const url = absolutizeImageUrl(img.imageUrl);
      if (!url) return null;
      return {
        id: img.id ?? `be-${productId}-${index}`,
        url,
        sortOrder:
          typeof img.displayOrder === "number" ? img.displayOrder : index,
        isPrimary: img.isPrimary ?? index === 0,
      };
    })
    .filter((img): img is ProductImage => img !== null)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // Promote a single image to isPrimary if none was flagged.
  if (mappedImages.length > 0 && !mappedImages.some((img) => img.isPrimary)) {
    mappedImages[0].isPrimary = true;
  }

  // ── Variants ────────────────────────────────────────────────────────
  const rawVariants = Array.isArray(details?.variants) ? details!.variants! : [];
  const mappedVariants: ProductVariant[] = rawVariants.map((v) => {
    const attrs = v.attributes ?? {};
    return {
      id: v.id,
      sku: v.sku,
      size: attrString(attrs, "size"),
      color: attrString(attrs, "color"),
      storage: attrString(attrs, "storage"),
      price:
        typeof v.price === "number"
          ? v.price
          : typeof v.price === "string" && v.price.trim() !== ""
            ? Number(v.price)
            : undefined,
      attributes: attrs,
      status: v.status,
      // Inventory is intentionally left undefined here. The service
      // layer fills it in from /api/v1/inventory/variant/{id} when
      // available; until then, the UI shows OUT_OF_STOCK which is the
      // safe default for a backend we cannot trust to have a number.
      inventory: undefined,
    };
  });

  // ── Specifications ──────────────────────────────────────────────────
  const rawSpecs = Array.isArray(details?.specifications)
    ? details!.specifications!
    : [];
  const specifications: Record<string, string> = {};
  for (const spec of rawSpecs) {
    const name = spec.specificationName?.trim();
    const value = spec.specificationValue?.trim();
    if (!name || value === undefined) continue;
    specifications[name] = value;
  }

  // ── Description / Warranty / Brand ──────────────────────────────────
  const information = details?.information;
  const longDescription = information?.longDescription?.trim();
  const shortDescription = information?.shortDescription?.trim();
  const description =
    longDescription && longDescription.length > 0
      ? longDescription
      : shortDescription && shortDescription.length > 0
        ? shortDescription
        : baseProduct.description ?? "";

  const warranty = information?.warranty?.trim() || undefined;
  const brand =
    baseProduct.brandName?.trim() ||
    baseProduct.brand?.trim() ||
    information?.manufacturer?.trim() ||
    "";

  const category =
    baseProduct.categoryName?.trim() ||
    baseProduct.category?.trim() ||
    "";

  // ── Aggregate parent inventory (currently always 0) ─────────────────
  // The base product does not yet expose a top-level inventory block.
  // The variant list is still exposed so the parent can derive "in
  // stock" once the per-variant inventory is merged in by the service.
  const aggregateInventory: ProductInventory = (() => {
    if (mappedVariants.length === 0) {
      return { quantity: 0, reservedQty: 0, available: 0 };
    }
    return { quantity: 0, reservedQty: 0, available: 0 };
  })();

  // ── Slug ────────────────────────────────────────────────────────────
  const slug =
    baseProduct.slug ||
    (typeof baseProduct.name === "string"
      ? baseProduct.name
          .toLowerCase()
          .replace(/['’]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : String(productId));

  const partial: Product = {
    id: productId,
    slug,
    title: baseProduct.name ?? "",
    description,
    brand,
    category,
    categorySlug: undefined,
    image: mappedImages[0]?.url ?? "",
    images: mappedImages,
    // Price is not part of the current contract. Keep 0 so callers
    // can still detect "missing" via `price === 0` and the existing
    // UI doesn't have to branch on undefined.
    price: typeof baseProduct.price === "number" ? baseProduct.price : 0,
    originalPrice:
      typeof baseProduct.originalPrice === "number"
        ? baseProduct.originalPrice
        : undefined,
    discount:
      typeof baseProduct.discount === "number"
        ? baseProduct.discount
        : undefined,
    rating: Number(baseProduct.rating ?? 0),
    reviews: Number(baseProduct.reviewsCount ?? 0),
    inventory: aggregateInventory,
    variants: mappedVariants,
    warranty,
    specifications,
  };

  return normalizeProduct(partial);
}

/**
 * Merge per-variant inventory records (sourced from
 * `GET /api/v1/inventory/variant/{variantId}`) into a Product's variants
 * in place. The function is pure: it returns a new array of variants.
 */
export function mergeVariantInventory(
  product: Product,
  inventoryByVariant: Record<
    string | number,
    {
      quantity?: number;
      reservedQuantity?: number;
      availableQuantity?: number;
      stockStatus?: string;
    }
  >,
): Product {
  if (!product.variants || product.variants.length === 0) return product;

  const mergedVariants = product.variants.map((v) => {
    const inv = inventoryByVariant[String(v.id)] ?? inventoryByVariant[v.id];
    if (!inv) return v;
    const quantity = Number(inv.quantity ?? 0);
    const reservedQty = Number(inv.reservedQuantity ?? 0);
    const available =
      typeof inv.availableQuantity === "number"
        ? Math.max(0, inv.availableQuantity)
        : Math.max(0, quantity - reservedQty);
    return {
      ...v,
      inventory: { quantity, reservedQty, available },
      stockStatus: inv.stockStatus ?? v.stockStatus,
    };
  });

  return {
    ...product,
    variants: mergedVariants,
  };
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
