/**
 * NEXTCART — Product service boundary.
 *
 * All product API communication lives here.
 * UI components should not know backend endpoint paths.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

import type {
  Product,
  Review,
  ReviewSummary,
} from "@/types/product";

import { toCardProduct, type CardProduct } from "@/types/product";

import type { PincodeCheckResult } from "@/types/delivery";

import {
  mergeVariantInventory,
  normalizeBackendProduct,
  normalizeBackendProductDetails,
  type BackendProductDetailsDto,
  type BackendProductDto,
} from "@/utils/normalizeProduct";

export type {
  Product,
  CardProduct,
  Review,
  ReviewSummary,
};

/* -------------------------------------------------------------------------- */
/* Endpoint definitions                                                       */
/* -------------------------------------------------------------------------- */

const ENDPOINTS = {
  products: "/api/v1/products",

  productById: (id: string | number) =>
    `/api/v1/products/${encodeURIComponent(String(id))}`,

  productDetailsById: (id: string | number) =>
    `/api/v1/products/${encodeURIComponent(String(id))}/details`,

  searchProducts: (keyword: string) =>
    `/api/v1/products/search?keyword=${encodeURIComponent(keyword)}`,

  filterProducts: (params: string) =>
    `/api/v1/products/filter${params ? `?${params}` : ""}`,

  categoryProducts: (categoryId: string | number) =>
    `/api/v1/products/category/${encodeURIComponent(String(categoryId))}`,

  subCategoryProducts: (subCategoryId: string | number) =>
    `/api/v1/products/subcategory/${encodeURIComponent(
      String(subCategoryId),
    )}`,

  productImagesByProduct: (productId: string | number) =>
    `/api/v1/product-images/product/${encodeURIComponent(String(productId))}`,

  productVariantsByProduct: (productId: string | number) =>
    `/api/v1/product-variants/product/${encodeURIComponent(String(productId))}`,

  productSpecificationsByProduct: (productId: string | number) =>
    `/api/v1/product-specifications/product/${encodeURIComponent(
      String(productId),
    )}`,

  productInformationByProduct: (productId: string | number) =>
    `/api/v1/product-information/${encodeURIComponent(String(productId))}`,

  inventoryByVariant: (variantId: string | number) =>
    `/api/v1/inventory/variant/${encodeURIComponent(String(variantId))}`,

  /*
   * These endpoints are kept here because existing product-detail UI
   * components still depend on them.
   *
   * They can be connected to their respective backend modules when
   * those controllers are available.
   */
  productReviews: (id: string | number) =>
    `/api/v1/products/${encodeURIComponent(String(id))}/reviews`,

  productRelated: (id: string | number) =>
    `/api/v1/products/${encodeURIComponent(String(id))}/related`,

  inventory: (variantId: string | number) =>
    `/api/v1/inventory/${encodeURIComponent(String(variantId))}`,

  deliveryCheck: (pincode: string) =>
    `/api/delivery/check?pincode=${encodeURIComponent(pincode)}`,
} as const;

/* -------------------------------------------------------------------------- */
/* Product detail                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Backend currently exposes products by ID, not slug.
 *
 * We therefore:
 *   1. Load the catalogue (`GET /api/v1/products`) and find the product
 *      whose `slug` matches.
 *   2. If the backend is reachable, we then call
 *      `GET /api/v1/products/{id}/details` to load images, variants,
 *      specifications and product information.
 *   3. If the details call fails for any reason we degrade to the
 *      base product (so the page still renders) and we surface the
 *      error on the returned object so the caller can decide what to
 *      do.
 *   4. If the backend catalogue itself is unreachable, we fall back to
 *      the in-house mock data set (controlled via `useMockFallback`).
 */
export async function getProductBySlug(
  slug: string,
  options: {
    signal?: AbortSignal;
    useMockFallback?: boolean;
  } = {},
): Promise<
  ApiResult<Product> & {
    source: "backend" | "fallback" | "error";
    reason?: string;
  }
> {
  const { signal, useMockFallback = true } = options;

  const list = await listProducts({
    signal,
    useMockFallback,
  });

  if (list.source === "error") {
    return {
      ok: false,
      status: 500,
      message: list.message,
      source: "error",
    };
  }

  const base =
    list.products.find((item) => item.slug === slug) ??
    (useMockFallback ? getMockProductBySlug(slug) : undefined);

  if (!base) {
    return {
      ok: false,
      status: 404,
      message: `Product "${slug}" not found.`,
      errorCode: "PRODUCT_NOT_FOUND",
      source: list.source === "backend" ? "backend" : "fallback",
    };
  }

  // If the product came from the mock catalogue we can short-circuit.
  if (list.source === "fallback") {
    return {
      ok: true,
      status: 200,
      data: base,
      source: "fallback",
      reason: list.reason,
    };
  }

  // Real backend product — try to upgrade with the details payload so
  // the page shows images / variants / specs sourced from the API.
  const id = base.id;
  const detailsResult = await getProductDetailsById(id, { signal });

  if (detailsResult.ok) {
    return {
      ok: true,
      status: 200,
      data: detailsResult.data,
      source: "backend",
    };
  }

  // Details call failed — return the base product so the page still
  // renders, and report the details error as `reason` for the caller.
  return {
    ok: true,
    status: 200,
    data: base,
    source: "backend",
    reason: `Details unavailable: ${detailsResult.message}`,
  };
}

/**
 * Fetch product directly by backend ID (base `ProductResponse` only).
 */
export async function getProductById(
  id: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product>> {
  const result = await apiRequest<BackendProductDto>(
    ENDPOINTS.productById(id),
    {
      method: "GET",
      signal,
    },
  );

  if (!result.ok) return result;

  try {
    const normalized = normalizeBackendProduct(result.data);
    return { ok: true, status: result.status, data: normalized };
  } catch {
    return {
      ok: false,
      status: 500,
      message: "Failed to normalize product payload.",
    };
  }
}

/**
 * Fetch the full `ProductDetailsResponse` for a product and normalize
 * it into the in-house `Product` shape (images, variants, specs,
 * information, warranty, manufacturer).
 *
 * After the details are normalized, we also fetch per-variant
 * inventory from `GET /api/v1/inventory/variant/{id}` and merge it
 * in. Inventory failures degrade to "out of stock" (the safe default
 * when we cannot prove stock exists) rather than fabricating a value.
 */
export async function getProductDetailsById(
  id: string | number,
  options: { signal?: AbortSignal; loadInventory?: boolean } = {},
): Promise<ApiResult<Product>> {
  const { signal, loadInventory = true } = options;

  const result = await apiRequest<BackendProductDetailsDto>(
    ENDPOINTS.productDetailsById(id),
    {
      method: "GET",
      signal,
    },
  );

  if (!result.ok) return result;

  let product: Product;
  try {
    product = normalizeBackendProductDetails(result.data, result.data?.product);
  } catch {
    return {
      ok: false,
      status: 500,
      message: "Failed to normalize product details.",
    };
  }

  if (loadInventory && product.variants && product.variants.length > 0) {
    const inventoryByVariant = await loadVariantInventory(
      product.variants,
      signal,
    );
    product = mergeVariantInventory(product, inventoryByVariant);
  }

  return { ok: true, status: result.status, data: product };
}

/* -------------------------------------------------------------------------- */
/* Per-variant inventory                                                      */
/* -------------------------------------------------------------------------- */

interface VariantInventory {
  quantity?: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  stockStatus?: string;
}

const VARIANT_INVENTORY_CONCURRENCY = 4;

/**
 * Fetch per-variant inventory in small parallel batches. Returns an
 * empty record (not a thrown error) when every request fails so the
 * caller can fall back to the safe "out of stock" default.
 */
async function loadVariantInventory(
  variants: { id: string | number }[],
  signal?: AbortSignal,
): Promise<Record<string | number, VariantInventory>> {
  const out: Record<string | number, VariantInventory> = {};
  for (let i = 0; i < variants.length; i += VARIANT_INVENTORY_CONCURRENCY) {
    const batch = variants.slice(i, i + VARIANT_INVENTORY_CONCURRENCY);
    const responses = await Promise.all(
      batch.map((v) =>
        apiRequest<{
          quantity?: number;
          reservedQuantity?: number;
          availableQuantity?: number;
          stockStatus?: string;
        }>(ENDPOINTS.inventoryByVariant(v.id), {
          method: "GET",
          signal,
        }),
      ),
    );
    responses.forEach((res, idx) => {
      if (!res || !res.ok) return;
      out[batch[idx].id] = res.data;
    });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Bulk enrichment                                                            */
/* -------------------------------------------------------------------------- */

const ENRICH_CONCURRENCY = 3;

/**
 * Upgrade a list of products (typically the catalogue returned by
 * `listProducts`) by issuing `GET /api/v1/products/{id}/details` for
 * each one in parallel batches. The original product is preserved when
 * the details call fails, so a single 404/500 never blanks the grid.
 */
export async function enrichProductListWithDetails(
  products: Product[],
  options: { signal?: AbortSignal; loadInventory?: boolean } = {},
): Promise<Product[]> {
  if (!products || products.length === 0) return products;
  const { signal, loadInventory = false } = options;

  const out: Product[] = new Array(products.length);
  for (let i = 0; i < products.length; i += ENRICH_CONCURRENCY) {
    const batch = products.slice(i, i + ENRICH_CONCURRENCY);
    const responses = await Promise.all(
      batch.map((p) =>
        getProductDetailsById(p.id, { signal, loadInventory }).catch(
          () => null,
        ),
      ),
    );
    batch.forEach((original, idx) => {
      const upgraded = responses[idx];
      if (upgraded && upgraded.ok) {
        out[i + idx] = upgraded.data;
      } else {
        out[i + idx] = original;
      }
    });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Search / catalogue                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Search products using the real Spring Boot backend.
 *
 * The `/api/v1/products/search` endpoint returns bare `ProductResponse[]`
 * (name / brandName / categoryName — no `title`, `image` or `price`). The
 * search store filters on `product.title` / `.brand` / `.category`, so the
 * raw DTO would throw a TypeError there. Normalize every result through the
 * same adapter the catalogue uses so search consumes canonical `Product`s.
 */
export async function searchProducts(
  keyword: string,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  const result = await apiRequest<BackendProductDto[] | unknown>(
    ENDPOINTS.searchProducts(keyword),
    {
      method: "GET",
      signal,
    },
  );

  if (!result.ok) return result;

  const raw = result.data;
  if (!Array.isArray(raw)) {
    return {
      ok: false,
      status: 500,
      message: "Search returned an unexpected payload.",
    };
  }

  const products = raw
    .map((dto) => {
      try {
        return normalizeBackendProduct(dto as BackendProductDto);
      } catch {
        return null;
      }
    })
    .filter((product): product is Product => product !== null);

  return { ok: true, status: result.status, data: products };
}

/**
 * Fetch all products from the real backend.
 */
export async function listBackendProducts(
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(
    ENDPOINTS.products,
    {
      method: "GET",
      signal,
    },
  );
}

/**
 * Filter products through the backend.
 *
 * Supported backend parameters:
 * - categoryId
 * - subCategoryId
 * - keyword
 */
export async function filterBackendProducts(
  params: {
    categoryId?: number;
    subCategoryId?: number;
    keyword?: string;
  },
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  const searchParams = new URLSearchParams();

  if (params.categoryId !== undefined) {
    searchParams.set(
      "categoryId",
      String(params.categoryId),
    );
  }

  if (params.subCategoryId !== undefined) {
    searchParams.set(
      "subCategoryId",
      String(params.subCategoryId),
    );
  }

  if (params.keyword?.trim()) {
    searchParams.set(
      "keyword",
      params.keyword.trim(),
    );
  }

  return apiRequest<Product[]>(
    ENDPOINTS.filterProducts(searchParams.toString()),
    {
      method: "GET",
      signal,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Category APIs                                                              */
/* -------------------------------------------------------------------------- */

export async function getProductsByCategory(
  categoryId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(
    ENDPOINTS.categoryProducts(categoryId),
    {
      method: "GET",
      signal,
    },
  );
}

export async function getProductsBySubCategory(
  subCategoryId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(
    ENDPOINTS.subCategoryProducts(subCategoryId),
    {
      method: "GET",
      signal,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Product reviews                                                            */
/* -------------------------------------------------------------------------- */

export async function getProductReviews(
  productId: string | number,
  signal?: AbortSignal,
): Promise<
  ApiResult<{
    summary: ReviewSummary;
    reviews: Review[];
  }>
> {
  return apiRequest<{
    summary: ReviewSummary;
    reviews: Review[];
  }>(
    ENDPOINTS.productReviews(productId),
    {
      method: "GET",
      signal,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Related products                                                           */
/* -------------------------------------------------------------------------- */

export async function getRelatedProducts(
  productId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(
    ENDPOINTS.productRelated(productId),
    {
      method: "GET",
      signal,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Inventory                                                                  */
/* -------------------------------------------------------------------------- */

export async function getInventory(
  variantId: string | number,
  signal?: AbortSignal,
): Promise<
  ApiResult<{
    available: number;
    quantity: number;
    reservedQty: number;
  }>
> {
  return apiRequest(
    ENDPOINTS.inventory(variantId),
    {
      method: "GET",
      signal,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Delivery                                                                   */
/* -------------------------------------------------------------------------- */

export async function checkPincodeServiceability(
  pincode: string,
  productId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<PincodeCheckResult>> {
  return apiRequest<PincodeCheckResult>(
    ENDPOINTS.deliveryCheck(pincode),
    {
      method: "GET",
      headers: {
        "X-Product-Id": String(productId),
      },
      signal,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Mock data                                                                  */
/* -------------------------------------------------------------------------- */

import mockProducts from "@/data/products";

import { normalizeProduct } from "@/utils/normalizeProduct";

const MOCK_PRODUCT_MAP: Map<string, Product> = new Map(
  mockProducts.map((product) => [
    product.slug,
    normalizeProduct(product as Product),
  ]),
);

export function getMockProductBySlug(
  slug: string,
): Product | undefined {
  return MOCK_PRODUCT_MAP.get(slug);
}

export function listMockProducts(): Product[] {
  return Array.from(MOCK_PRODUCT_MAP.values());
}

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

export type ListProductsResult =
  | {
      source: "backend";
      products: Product[];
    }
  | {
      source: "fallback";
      products: Product[];
      reason: string;
    }
  | {
      source: "error";
      message: string;
      errorCode?: string;
    };

interface ListProductsOptions {
  signal?: AbortSignal;

  /**
   * Default true for development compatibility.
   *
   * Search explicitly disables this so production/search does not silently
   * display mock data when the backend fails.
   */
  useMockFallback?: boolean;
}

/**
 * Fetch the complete catalogue from Spring Boot.
 */
export async function listProducts(
  options: ListProductsOptions = {},
): Promise<ListProductsResult> {
  const {
    signal,
    useMockFallback = true,
  } = options;

  const result = await apiRequest<
    BackendProductDto[] | unknown
  >(
    ENDPOINTS.products,
    {
      method: "GET",
      signal,
    },
  );

  if (result.ok) {
    const raw = result.data;

    if (Array.isArray(raw)) {
      const products = raw
        .map((dto) => {
          try {
            return normalizeBackendProduct(
              dto as BackendProductDto,
            );
          } catch {
            return null;
          }
        })
        .filter(
          (product): product is Product =>
            product !== null,
        );

      return {
        source: "backend",
        products,
      };
    }

    if (useMockFallback) {
      return {
        source: "fallback",
        products: listMockProducts(),
        reason:
          "Backend returned an unexpected payload.",
      };
    }

    return {
      source: "error",
      message:
        "Backend returned an unexpected payload.",
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

/* -------------------------------------------------------------------------- */
/* Card conversion                                                            */
/* -------------------------------------------------------------------------- */

export function toCard(
  product: Product,
): CardProduct {
  return toCardProduct(product);
}