/**
 * NEXTCART — Product service boundary.
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

import type { PincodeCheckResult } from "@/types/delivery";

import {
  mergeVariantInventory,
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

  /* -------------------------------- Filter ------------------------------- */

  filterProducts: (params: string) =>
    `/api/v1/products/filter${params ? `?${params}` : ""}`,

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

  /* ----------------------------- Inventory ------------------------------- */

  inventoryByVariant: (variantId: string | number) =>
    `/api/v1/inventory/variant/${encodeURIComponent(String(variantId))}`,

  inventory: (variantId: string | number) =>
    `/api/v1/inventory/${encodeURIComponent(String(variantId))}`,

  /* ------------------------------- Reviews ------------------------------- */

  productReviews: (id: string | number) =>
    `/api/v1/products/${encodeURIComponent(String(id))}/reviews`,

  /* ------------------------------- Related ------------------------------- */

  productRelated: (id: string | number) =>
    `/api/v1/products/${encodeURIComponent(String(id))}/related`,

  /* ------------------------------- Delivery ------------------------------ */

  deliveryCheck: (pincode: string) =>
    `/api/delivery/check?pincode=${encodeURIComponent(pincode)}`,
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
  content: BackendProductDto[];
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
 *   normalize details
 *        ↓
 *   load variant inventory
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

  const result =
    await apiRequest<BackendProductDetailsDto>(
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

  try {
    let product =
      normalizeBackendProductDetails(
        result.data,
      );

    /*
     * ProductDetailsResponse does not currently
     * contain inventory.
     *
     * Load inventory separately for each variant.
     */
    if (
      product.variants &&
      product.variants.length > 0
    ) {
      const inventoryByVariant =
        await loadVariantInventory(
          product.variants,
          signal,
        );

      product =
        mergeVariantInventory(
          product,
          inventoryByVariant,
        );
    }

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
    await apiRequest<BackendProductDto>(
      ENDPOINTS.productById(id),
      {
        method: "GET",
        signal,
      },
    );

  if (!result.ok) {
    return result;
  }

  try {
    const normalized =
      normalizeBackendProduct(
        result.data,
      );

    return {
      ok: true,
      status: result.status,
      data: normalized,
    };
  } catch {
    return {
      ok: false,
      status: 500,
      message:
        "Failed to normalize product payload.",
      errorCode:
        "PRODUCT_NORMALIZATION_FAILED",
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
    loadInventory?: boolean;
  } = {},
): Promise<ApiResult<Product>> {
  const {
    signal,
    loadInventory = true,
  } = options;

  const result =
    await apiRequest<BackendProductDetailsDto>(
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
    product =
      normalizeBackendProductDetails(
        result.data,
      );
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

  if (
    loadInventory &&
    product.variants &&
    product.variants.length > 0
  ) {
    const inventoryByVariant =
      await loadVariantInventory(
        product.variants,
        signal,
      );

    product =
      mergeVariantInventory(
        product,
        inventoryByVariant,
      );
  }

  return {
    ok: true,
    status: result.status,
    data: product,
  };
}

/* -------------------------------------------------------------------------- */
/* Per-variant inventory                                                      */
/* -------------------------------------------------------------------------- */

interface VariantInventory {
  quantity?: number;
  reservedQuantity?: number;
  reservedQty?: number;
  availableQuantity?: number;
  stockStatus?: string;
}

const VARIANT_INVENTORY_CONCURRENCY = 4;

/**
 * Fetch inventory for product variants in small parallel batches.
 */
async function loadVariantInventory(
  variants: {
    id: string | number;
  }[],
  signal?: AbortSignal,
): Promise<
  Record<string | number, VariantInventory>
> {
  const out: Record<
    string | number,
    VariantInventory
  > = {};

  for (
    let i = 0;
    i < variants.length;
    i += VARIANT_INVENTORY_CONCURRENCY
  ) {
    const batch = variants.slice(
      i,
      i + VARIANT_INVENTORY_CONCURRENCY,
    );

    const responses =
      await Promise.all(
        batch.map((variant) =>
          apiRequest<VariantInventory>(
            ENDPOINTS.inventoryByVariant(
              variant.id,
            ),
            {
              method: "GET",
              signal,
            },
          ),
        ),
      );

    responses.forEach(
      (response, index) => {
        if (!response || !response.ok) {
          return;
        }

        out[
          String(batch[index].id)
        ] = response.data;
      },
    );
  }

  return out;
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
    loadInventory?: boolean;
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
    loadInventory = false,
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
              loadInventory,
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

  const raw = result.data;

  if (!Array.isArray(raw)) {
    return {
      ok: false,
      status: 500,
      message:
        "Search returned an unexpected payload.",
      errorCode:
        "SEARCH_INVALID_PAYLOAD",
    };
  }

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

/**
 * Fetch products directly from the backend.
 *
 * Backend response:
 *
 * ApiResponse
 *   -> data
 *      -> content
 *
 * Therefore:
 *
 * result.data.data.content
 *
 * contains the actual product array.
 */
export async function listBackendProducts(
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  const result =
    await apiRequest<BackendProductPageResponse>(
      ENDPOINTS.products,
      {
        method: "GET",
        signal,
      },
    );

  if (!result.ok) {
    return result;
  }

  const page =
    result.data?.data;

  if (
    !page ||
    !Array.isArray(page.content)
  ) {
    return {
      ok: false,
      status: 500,
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
          return normalizeBackendProduct(
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
    ok: true,
    status: result.status,
    data: products,
  };
}

/* -------------------------------------------------------------------------- */
/* Filter                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Filter products through the backend.
 *
 * Supported parameters:
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
  const searchParams =
    new URLSearchParams();

  if (
    params.categoryId !==
    undefined
  ) {
    searchParams.set(
      "categoryId",
      String(params.categoryId),
    );
  }

  if (
    params.subCategoryId !==
    undefined
  ) {
    searchParams.set(
      "subCategoryId",
      String(params.subCategoryId),
    );
  }

  if (
    params.keyword?.trim()
  ) {
    searchParams.set(
      "keyword",
      params.keyword.trim(),
    );
  }

  return apiRequest<Product[]>(
    ENDPOINTS.filterProducts(
      searchParams.toString(),
    ),
    {
      method: "GET",
      signal,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Category APIs                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Get products by category.
 *
 * Backend:
 * GET /api/v1/products/category/{categoryId}
 */
export async function getProductsByCategory(
  categoryId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(
    ENDPOINTS.categoryProducts(
      categoryId,
    ),
    {
      method: "GET",
      signal,
    },
  );
}

/**
 * Get products by subcategory.
 *
 * Backend:
 * GET /api/v1/products/subcategory/{subCategoryId}
 */
export async function getProductsBySubCategory(
  subCategoryId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(
    ENDPOINTS.subCategoryProducts(
      subCategoryId,
    ),
    {
      method: "GET",
      signal,
    },
  );
}

/**
 * Get products by brand.
 *
 * Backend:
 * GET /api/v1/products/brand/{brandId}
 */
export async function getProductsByBrand(
  brandId: string | number,
  signal?: AbortSignal,
): Promise<ApiResult<Product[]>> {
  return apiRequest<Product[]>(
    ENDPOINTS.brandProducts(
      brandId,
    ),
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
    ENDPOINTS.productReviews(
      productId,
    ),
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
    ENDPOINTS.productRelated(
      productId,
    ),
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
  return apiRequest<{
    available: number;
    quantity: number;
    reservedQty: number;
  }>(
    ENDPOINTS.inventory(
      variantId,
    ),
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
): Promise<
  ApiResult<PincodeCheckResult>
> {
  return apiRequest<PincodeCheckResult>(
    ENDPOINTS.deliveryCheck(
      pincode,
    ),
    {
      method: "GET",
      headers: {
        "X-Product-Id":
          String(productId),
      },
      signal,
    },
  );
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
          return normalizeBackendProduct(
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