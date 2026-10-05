/**
 * HAVLOOK — Product service boundary.
 *
 * All product API communication lives here.
 * UI components should not know backend endpoint paths.
 *
 * The service is backend-only. There is NO mock product fallback.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

import type {
  Product,
  Review,
  ReviewSummary,
} from "@/types/product";

import { toCardProduct, type CardProduct } from "@/types/product";

import {
  normalizeBackendProduct,
  normalizeBackendProductDetails,
  type BackendProductDetailsDto,
  type BackendProductDto,
} from "@/utils/normalizeProduct";

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

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
  /* ----------------------------- Catalogue ------------------------------ */

  products: "/api/v1/products",

  productById: (id: string | number) =>
    `/api/v1/products/${encodeURIComponent(String(id))}`,

  productBySlug: (slug: string) =>
    `/api/v1/products/slug/${encodeURIComponent(slug)}`,

  /* ---------------------------- Product details ------------------------- */

  productDetailsById: (id: string | number) =>
    `/api/v1/products/${encodeURIComponent(String(id))}/details`,

  productDetailsBySlug: (slug: string) =>
    `/api/v1/products/slug/${encodeURIComponent(slug)}/details`,

  /* ------------------------------- Search -------------------------------- */

  searchProducts: (keyword: string) =>
    `/api/v1/products/search?keyword=${encodeURIComponent(keyword)}`,
  /* ------------------------------ Category ------------------------------- */

  categoryProducts: (categoryId: string | number) =>
    `/api/v1/products/category/${encodeURIComponent(String(categoryId))}`,

  /* ---------------------------- Subcategory ------------------------------ */

  subCategoryProducts: (subCategoryId: string | number) =>
    `/api/v1/products/subcategory/${encodeURIComponent(
      String(subCategoryId),
    )}`,

  /* -------------------------------- Brand -------------------------------- */

  brandProducts: (brandId: string | number) =>
    `/api/v1/products/brand/${encodeURIComponent(String(brandId))}`,

  /* ------------------------------- Images -------------------------------- */

  productImagesByProduct: (productId: string | number) =>
    `/api/v1/product-images/product/${encodeURIComponent(String(productId))}`,

  /* ------------------------------ Variants ------------------------------- */

  productVariantsByProduct: (productId: string | number) =>
    `/api/v1/product-variants/product/${encodeURIComponent(String(productId))}`,

  /* -------------------------- Specifications ---------------------------- */

  productSpecificationsByProduct: (productId: string | number) =>
    `/api/v1/product-specifications/product/${encodeURIComponent(
      String(productId),
    )}`,

  /* ---------------------------- Information ------------------------------ */

  productInformationByProduct: (productId: string | number) =>
    `/api/v1/product-information/${encodeURIComponent(String(productId))}`,
} as const;

/* -------------------------------------------------------------------------- */
/* Backend catalogue response                                                */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/products returns:
 *
 * {
 *   success: true,
 *   message: "Products fetched successfully",
 *   data: {
 *     content: [...],
 *     totalElements: 20,
 *     totalPages: 1,
 *     ...
 *   }
 * }
 */

interface BackendProductPage {
  content: BackendProductDetailsDto[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

interface BackendProductPageResponse {
  success?: boolean;
  message?: string;
  data?: BackendProductPage;
}

interface BackendProductSummaryPageResponse {
  success?: boolean;
  message?: string;
  data?: {
    content?: BackendProductDto[];
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
  };
}

interface BackendProductResponse {
  success?: boolean;
  message?: string;
  data?: BackendProductDto;
}

interface BackendProductDetailsResponse {
  success?: boolean;
  message?: string;
  data?: BackendProductDetailsDto;
}

/* -------------------------------------------------------------------------- */
/* Product by slug                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Fetch complete product details directly by slug.
 *
 * Backend endpoint:
 *
 * GET /api/v1/products/slug/{slug}/details
 *
 * This is the preferred method for the Product Details Page.
 *
 * Previous flow:
 *
 *   GET /products
 *        ↓
 *   find product by slug
 *        ↓
 *   GET /products/{id}/details
 *
 * New flow:
 *
 *   GET /products/slug/{slug}/details
 *        ↓
 *   normalize details (variants carry the backend's own
 *   `stockStatus` / `available` fields — no separate inventory call)
 */
export async function getProductBySlug(
  slug: string,
  options: {
    signal?: AbortSignal;
  } = {},
): Promise<
  ApiResult<Product> & {
    source: "backend" | "error";
    reason?: string;
  }
> {
  const { signal } = options;

  try {
    const result =
      await apiRequest<BackendProductDetailsResponse>(
        ENDPOINTS.productDetailsBySlug(slug),
        {
          method: "GET",
          signal,
        },
      );

    if (!result.ok) {
      return {
        ok: false,
        status: result.status,
        message: result.message,
        errorCode: result.errorCode,
        source: "error",
      };
    }

    const details = result.data?.data;

    if (!details) {
      return {
        ok: false,
        status: 500,
        message: "Product details payload is missing.",
        errorCode: "PRODUCT_DETAILS_INVALID_PAYLOAD",
        source: "error",
      };
    }

    let product: Product =
      normalizeBackendProductDetails(details);

    return {
      ok: true,
      status: result.status,
      data: product,
      source: "backend",
    };
  } catch {
    return {
      ok: false,
      status: 500,
      message:
        "Failed to normalize product details.",
      errorCode:
        "PRODUCT_NORMALIZATION_FAILED",
      source: "error",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Product by ID                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Fetch product directly by backend ID.
 *
 * Backend:
 *
 * GET /api/v1/products/{id}
 */
export async function getProductById(
  id: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product>> {
  const result =
    await apiRequest<BackendProductResponse>(
      ENDPOINTS.productById(id),
      {
        method: "GET",
        signal,
      },
    );

  if (!result.ok) {
    return result;
  }

  const productDto = result.data?.data;

  if (!productDto) {
    return {
      ok: false,
      status: 500,
      message: "Product payload is missing.",
      errorCode: "PRODUCT_INVALID_PAYLOAD",
    };
  }

  try {
    const product = normalizeBackendProduct(productDto);

    return {
      ok: true,
      status: result.status,
      data: product,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      message: "Failed to normalize product.",
      errorCode: "PRODUCT_NORMALIZATION_FAILED",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Product details by ID                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Fetch complete product details by ID.
 *
 * Backend:
 *
 * GET /api/v1/products/{id}/details
 *
 * Loads:
 * - images
 * - variants
 * - specifications
 * - product information
 * - warranty
 * - manufacturer
 *
 * Inventory is loaded separately for every variant.
 */
export async function getProductDetailsById(
  id: string | number,
  options: {
    signal?: AbortSignal;
  } = {},
): Promise<ApiResult<Product>> {
  const {
    signal,
  } = options;

  const result =
    await apiRequest<BackendProductDetailsResponse>(
      ENDPOINTS.productDetailsById(id),
      {
        method: "GET",
        signal,
      },
    );

  if (!result.ok) {
    return result;
  }

  let product: Product;

  try {
    const details = result.data?.data;

    if (!details) {
      return {
        ok: false,
        status: 500,
        message: "Product details payload is missing.",
        errorCode: "PRODUCT_DETAILS_INVALID_PAYLOAD",
      };
    }

    product =
      normalizeBackendProductDetails(details);
  } catch {
    return {
      ok: false,
      status: 500,
      message:
        "Failed to normalize product details.",
      errorCode:
        "PRODUCT_NORMALIZATION_FAILED",
    };
  }

  return {
    ok: true,
    status: result.status,
    data: product,
  };
}

/* -------------------------------------------------------------------------- */
/* Bulk enrichment                                                            */
/* -------------------------------------------------------------------------- */

const ENRICH_CONCURRENCY = 3;

/**
 * Upgrade catalogue products with detailed product data.
 *
 * A failed details request does not remove
 * the original product.
 */
export async function enrichProductListWithDetails(
  products: Product[],
  options: {
    signal?: AbortSignal;
  } = {},
): Promise<Product[]> {
  if (
    !products ||
    products.length === 0
  ) {
    return products;
  }

  const {
    signal,
  } = options;

  const out: Product[] =
    new Array(products.length);

  for (
    let i = 0;
    i < products.length;
    i += ENRICH_CONCURRENCY
  ) {
    const batch = products.slice(
      i,
      i + ENRICH_CONCURRENCY,
    );

    const responses =
      await Promise.all(
        batch.map((product) =>
          getProductDetailsById(
            product.id,
            {
              signal,
            },
          ).catch(() => null),
        ),
      );

    batch.forEach(
      (original, index) => {
        const upgraded =
          responses[index];

        if (
          upgraded &&
          upgraded.ok
        ) {
          out[i + index] =
            upgraded.data;
        } else {
          out[i + index] =
            original;
        }
      },
    );
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Search products using the real Spring Boot backend.
 *
 * Expected backend response:
 *
 * Product[]
 */
export async function searchProducts(
  keyword: string,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  const result =
    await apiRequest<
      BackendProductDto[] | unknown
    >(
      ENDPOINTS.searchProducts(keyword),
      {
        method: "GET",
        signal,
      },
    );

  if (!result.ok) {
    return result;
  }

  /*
   * Backend wraps the list in the standard envelope:
   *   { success, message, data: [...] }
   * so the array lives one level deeper than `result.data`.
   */
  const raw =
    result.data as
      | BackendProductDto[]
      | { data?: unknown }
      | null
      | undefined;

  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(
        (raw as { data?: unknown } | null)?.data,
      )
      ? ((raw as { data?: unknown }).data as BackendProductDto[])
      : null;

  if (!list) {
    return {
      ok: false,
      status: 500,
      message:
        "Search returned an unexpected payload.",
      errorCode:
        "SEARCH_INVALID_PAYLOAD",
    };
  }

  const products = list
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
      (
        product,
      ): product is Product =>
        product !== null,
    );

  return {
    ok: true,
    status: result.status,
    data: products,
  };
}

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Category APIs                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Get products by category.
 *
 * Backend:
 * GET /api/v1/products/category/{categoryId}
 */
async function normalizeProductSummaryPage(
  result: ApiResult<BackendProductSummaryPageResponse>,
): Promise<ApiResult<Product[]>> {
  if (!result.ok) {
    return result;
  }

  const content = result.data?.data?.content;

  if (!Array.isArray(content)) {
    return {
      ok: false,
      status: 500,
      message: "Product page payload is missing.",
      errorCode: "PRODUCT_PAGE_INVALID_PAYLOAD",
    };
  }

  const products = content
    .map((dto) => {
      try {
        return normalizeBackendProduct(dto);
      } catch {
        return null;
      }
    })
    .filter((product): product is Product => product !== null);

  return {
    ok: true,
    status: result.status,
    data: products,
  };
}

/**
 * Get products by category.
 *
 * Backend:
 * GET /api/v1/products/category/{categoryId}
 *
 * Response:
 * CommonResponseDto<Page<ProductResponse>>
 */
export async function getProductsByCategory(
  categoryId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  const result =
    await apiRequest<BackendProductSummaryPageResponse>(
      ENDPOINTS.categoryProducts(categoryId),
      {
        method: "GET",
        signal,
      },
    );

  return normalizeProductSummaryPage(result);
}

/**
 * Get products by subcategory.
 *
 * Backend:
 * GET /api/v1/products/subcategory/{subCategoryId}
 *
 * Response:
 * CommonResponseDto<Page<ProductResponse>>
 */
export async function getProductsBySubCategory(
  subCategoryId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  const result =
    await apiRequest<BackendProductSummaryPageResponse>(
      ENDPOINTS.subCategoryProducts(subCategoryId),
      {
        method: "GET",
        signal,
      },
    );

  return normalizeProductSummaryPage(result);
}

/**
 * Get products by brand.
 *
 * Backend:
 * GET /api/v1/products/brand/{brandId}
 *
 * Response:
 * CommonResponseDto<Page<ProductResponse>>
 */
export async function getProductsByBrand(
  brandId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  const result =
    await apiRequest<BackendProductSummaryPageResponse>(
      ENDPOINTS.brandProducts(brandId),
      {
        method: "GET",
        signal,
      },
    );

  return normalizeProductSummaryPage(result);
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
      source: "error";
      message: string;
      errorCode?: string;
    };

interface ListProductsOptions {
  signal?: AbortSignal;
}

/**
 * Fetch the complete catalogue from Spring Boot.
 *
 * Backend response:
 *
 * {
 *   success: true,
 *   message: "Products fetched successfully",
 *   data: {
 *     content: [...]
 *   }
 *
 * }
 *
 * There is NO mock fallback.
 */
export async function listProducts(
  options: ListProductsOptions = {},
): Promise<ListProductsResult> {
  const { signal } = options;

  const result =
    await apiRequest<BackendProductPageResponse>(
      ENDPOINTS.products,
      {
        method: "GET",
        signal,
      },
    );

  if (!result.ok) {
    return {
      source: "error",
      message: result.message,
      errorCode:
        result.errorCode,
    };
  }

  const page =
    result.data?.data;

  if (
    !page ||
    !Array.isArray(page.content)
  ) {
    return {
      source: "error",
      message:
        "Backend returned an unexpected product catalogue payload.",
      errorCode:
        "PRODUCT_CATALOGUE_INVALID_PAYLOAD",
    };
  }

  const products =
    page.content
      .map((dto) => {
        try {
          return normalizeBackendProductDetails(
            dto,
          );
        } catch {
          return null;
        }
      })
      .filter(
        (
          product,
        ): product is Product =>
          product !== null,
      );

  return {
    source: "backend",
    products,
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