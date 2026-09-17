/**
 * NEXTCART — Seller product service boundary.
 *
 * The backend currently exposes ONLY product creation for sellers:
 *   POST /api/v1/sellers/products   (multipart/form-data)
 *
 * There is no seller product list / detail / update / delete / status
 * endpoint in the current backend, so this service intentionally exposes
 * only `createProduct`.
 *
 * The backend resolves the seller from the JWT.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export interface SellerProductInformationRequest {
  shortDescription?: string;
  longDescription?: string;
  warranty?: string;
  manufacturer?: string;
}

export interface SellerProductSpecificationRequest {
  specificationName: string;
  specificationValue: string;
}

export interface SellerProductVariantAttributeRequest {
  attributeName: string;
  attributeValue: string;
}

export interface SellerProductVariantPriceRequest {
  mrp: number;
  sellingPrice: number;
  currency: string;
}

export interface SellerProductInventoryRequest {
  warehouseId: number;
  quantity: number;
  reservedQuantity?: number;
}

export interface SellerProductVariantRequest {
  sku: string;
  attributes: SellerProductVariantAttributeRequest[];
  price?: SellerProductVariantPriceRequest;
  inventories?: SellerProductInventoryRequest[];
}

export interface SellerProductCreateRequest {
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  name: string;
  slug: string;
  description?: string;
  information?: SellerProductInformationRequest;
  specifications?: SellerProductSpecificationRequest[];
  variants?: SellerProductVariantRequest[];
}

export interface SellerProductResponse {
  id: number;
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  name: string;
  slug: string;
  description?: string | null;
  status?: string | null;
  information?: unknown;
  specifications?: unknown;
  variants?: unknown;
  images?: unknown;
}

const ENDPOINT = "/api/v1/sellers/products";

/**
 * POST /api/v1/sellers/products
 *
 * Sends `productData` as a JSON part and `images` as repeated file parts,
 * matching the backend's `@RequestPart` contract.
 */
export async function createProduct(
  productData: SellerProductCreateRequest,
  images: File[],
  signal?: AbortSignal,
): Promise<ApiResult<SellerProductResponse>> {
  const form = new FormData();

  form.append(
    "productData",
    new Blob([JSON.stringify(productData)], { type: "application/json" }),
  );

  for (const image of images) {
    form.append("images", image);
  }

  const res = await apiRequest<SellerProductResponse>(ENDPOINT, {
    method: "POST",
    body: form,
    signal,
  });

  if (!res.ok) return res;

  if (!res.data || typeof res.data !== "object") {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid product response.",
    };
  }

  return { ok: true, status: res.status, data: res.data };
}

export type { ApiResult };
