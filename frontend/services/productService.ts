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
 * We therefore load the catalogue and resolve the requested slug locally.
 * This keeps the existing /products/[slug] frontend route working without
 * changing the UI or backend contract.
 */
export async function getProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ApiResult<Product>> {
  const result = await listProducts({
    signal,
    useMockFallback: false,
  });

  if (result.source === "error") {
    return {
      ok: false,
      status: 500,
      message: result.message,
    };
  }

  const product = result.products.find(
    (item) => item.slug === slug,
  );

  if (!product) {
    return {
      ok: false,
      status: 404,
      message: `Product "${slug}" not found.`,
      errorCode: "PRODUCT_NOT_FOUND",
    };
  }

  return {
    ok: true,
    status: 200,
    data: product,
  };
}

/**
 * Fetch product directly by backend ID.
 */
export async function getProductById(
  id: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product>> {
  return apiRequest<Product>(
    ENDPOINTS.productById(id),
    {
      method: "GET",
      signal,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Search / catalogue                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Search products using the real Spring Boot backend.
 */
export async function searchProducts(
  keyword: string,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(
    ENDPOINTS.searchProducts(keyword),
    {
      method: "GET",
      signal,
    },
  );
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

import {
  normalizeProduct,
  normalizeBackendProduct,
  type BackendProductDto,
} from "@/utils/normalizeProduct";

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