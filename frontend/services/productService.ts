/**
 * NEXTCART — Product service boundary.
 *
 * This is the ONLY module in the UI that knows the future Spring Boot
 * endpoint paths. If the backend renames `/api/products` to
 * `/api/v1/catalog/products` we change one file, not every component.
 *
 * Conventions:
 *   - Endpoints are kept as constants at the top so they're easy to grep.
 *   - Each function returns an `ApiResult<T>` (from lib/api) so callers
 *     handle errors uniformly without try/catch noise.
 *   - Mock-data fallbacks live here too — when the backend is unavailable
 *     we still render real-looking content. Components never import
 *     `data/products` directly any more.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

import type {
  Product,
  Review,
  ReviewSummary,
} from "@/types/product";
import { toCardProduct, type CardProduct } from "@/types/product";
import type { PincodeCheckResult } from "@/types/delivery";

// Re-export so UI code imports both Product-type and service from one place.
export type { Product, CardProduct, Review, ReviewSummary };

/* ─────────────────────────────────────────────────────────────────────
   Endpoint constants
   ───────────────────────────────────────────────────────────────────── */

const ENDPOINTS = {
  products: "/api/products",
  productBySlug: (slug: string) => `/api/products/${encodeURIComponent(slug)}`,
  productReviews: (slug: string) =>
    `/api/products/${encodeURIComponent(slug)}/reviews`,
  productRelated: (slug: string) =>
    `/api/products/${encodeURIComponent(slug)}/related`,
  inventory: (variantId: string | number) =>
    `/api/inventory/${encodeURIComponent(String(variantId))}`,
  deliveryCheck: "/api/delivery/check",
} as const;

/* ─────────────────────────────────────────────────────────────────────
   Service functions
   ───────────────────────────────────────────────────────────────────── */

/**
 * Fetch a single product by slug.
 * Replaces direct imports from `data/products` so future backend
 * integration is a one-file change.
 */
export async function getProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ApiResult<Product>> {
  const result = await apiRequest<Product>(ENDPOINTS.productBySlug(slug), {
    method: "GET",
    signal,
  });
  return result;
}

/**
 * Fetch the review list and summary for a product. Used by ProductReviews
 * and to populate the rating block on the info panel.
 */
export async function getProductReviews(
  slug: string,
  signal?: AbortSignal,
): Promise<
  ApiResult<{
    summary: ReviewSummary;
    reviews: Review[];
  }>
> {
  return apiRequest<{ summary: ReviewSummary; reviews: Review[] }>(
    ENDPOINTS.productReviews(slug),
    {
      method: "GET",
      signal,
    },
  );
}

/**
 * Fetch products related to the current one (same category, frequently
 * bought together, etc.). The backend decides the strategy — we just
 * render whatever we get back as cards.
 */
export async function getRelatedProducts(
  slug: string,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(ENDPOINTS.productRelated(slug), {
    method: "GET",
    signal,
  });
}

/**
 * Check the latest inventory for a single variant. Use this when the user
 * selects a variant and we want to refresh the in-stock state without
 * re-fetching the entire product.
 */
export async function getInventory(
  variantId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<{ available: number; quantity: number; reservedQty: number }>> {
  return apiRequest(ENDPOINTS.inventory(variantId), {
    method: "GET",
    signal,
  });
}

/**
 * Ask the backend whether a pincode can receive this product.
 * Until the backend exists the service layer is the only place that
 * performs this call — UI components stay agnostic.
 */
export async function checkPincodeServiceability(
  pincode: string,
  productId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<PincodeCheckResult>> {
  return apiRequest<PincodeCheckResult>(ENDPOINTS.deliveryCheck, {
    method: "GET",
    headers: { "X-Product-Id": String(productId) },
    // The DeliveryChecker builds its own query string because
    // apiRequest currently only joins a path. Encoding it here keeps the
    // public surface tidy.
    signal,
  }).then((res) => {
    if (res.ok) {
      return { ...res, data: { ...res.data, pincode } };
    }
    return res;
  });
}

/* ─────────────────────────────────────────────────────────────────────
   In-memory mock fallback for development
   ───────────────────────────────────────────────────────────────────── */

import mockProducts from "@/data/products";
import {
  normalizeProduct,
  normalizeBackendProduct,
  type BackendProductDto,
} from "@/utils/normalizeProduct";

const MOCK_PRODUCT_MAP: Map<string, Product> = new Map(
  mockProducts.map((p) => [p.slug, normalizeProduct(p as Product)]),
);

/** Read a product from the mock dataset (dev-only). */
export function getMockProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCT_MAP.get(slug);
}

/** Return the mock product list as a sync generator (dev-only). */
export function listMockProducts(): Product[] {
  return Array.from(MOCK_PRODUCT_MAP.values());
}

/* ─────────────────────────────────────────────────────────────────────
   List products (catalogue) with graceful mock fallback
   ───────────────────────────────────────────────────────────────────── */

/**
 * Result wrapper that distinguishes the three states a catalogue call
 * can end up in:
 *
 *   - backend  : real data came from GET /api/products.
 *   - fallback : the backend was unavailable; we served the local mock
 *                so the page still renders. The UI can show a soft
 *                "showing demo data" hint.
 *   - error    : the request failed AND the mock fallback was disabled
 *                (e.g. an explicit `useMockFallback: false`).
 */
export type ListProductsResult =
  | { source: "backend"; products: Product[] }
  | { source: "fallback"; products: Product[]; reason: string }
  | { source: "error"; message: string; errorCode?: string };

interface ListProductsOptions {
  signal?: AbortSignal;
  /**
   * When true (default) we fall back to the local mock dataset if the
   * backend is unavailable. Pass `false` to surface the failure instead
   * — useful for the catalogue page where you want to show an error
   * state rather than silently mock-data the user.
   */
  useMockFallback?: boolean;
}

/**
 * Fetch the full product catalogue. Hits GET /api/products and runs the
 * result through `normalizeBackendProduct()` so callers always get the
 * in-house `Product` shape.
 *
 * In development (backend offline) we fall back to the local mock data
 * so the page still renders. The `source` field on the result tells the
 * UI which path produced the list, so it can show a soft "demo data"
 * hint or an error state as appropriate.
 */
export async function listProducts(
  options: ListProductsOptions = {},
): Promise<ListProductsResult> {
  const { signal, useMockFallback = true } = options;

  const result = await apiRequest<BackendProductDto[] | unknown>(
    ENDPOINTS.products,
    { method: "GET", signal },
  );

  if (result.ok) {
    const raw = result.data;
    if (Array.isArray(raw)) {
      const products = raw
        .map((dto) => {
          try {
            return normalizeBackendProduct(dto as BackendProductDto);
          } catch {
            return null;
          }
        })
        .filter((p): p is Product => p !== null);
      return { source: "backend", products };
    }
    // Backend returned something unexpected — treat as a soft error.
    if (useMockFallback) {
      return {
        source: "fallback",
        products: listMockProducts(),
        reason: "Backend returned an unexpected payload.",
      };
    }
    return {
      source: "error",
      message: "Backend returned an unexpected payload.",
    };
  }

  if (useMockFallback) {
    return {
      source: "fallback",
      products: listMockProducts(),
      reason: result.message,
    };
  }
  return {
    source: "error",
    message: result.message,
    errorCode: result.errorCode,
  };
}

/** Convert a product into the card-shaped view used by listings. */
export function toCard(product: Product): CardProduct {
  return toCardProduct(product);
}
