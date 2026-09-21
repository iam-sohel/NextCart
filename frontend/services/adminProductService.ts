import { apiRequest } from "@/lib/api";

export interface AdminProduct {
  id: number;
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  name: string;
  slug: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductPage {
  content: AdminProduct[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

function unwrap<T>(response: any): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return response.data as T;
  }

  return response as T;
}

function toNumber(value: any): number {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function normalizeProduct(
  value: any
): AdminProduct {
  return {
    id: toNumber(value?.id),
    categoryId: toNumber(value?.categoryId),
    subCategoryId: toNumber(
      value?.subCategoryId
    ),
    brandId: toNumber(value?.brandId),
    name: value?.name ?? "",
    slug: value?.slug ?? "",
    description: value?.description ?? "",
    status: value?.status ?? "",
    createdAt: value?.createdAt ?? "",
    updatedAt: value?.updatedAt ?? "",
  };
}

function normalizePage(
  value: any
): AdminProductPage {
  const content = Array.isArray(value?.content)
    ? value.content.map(normalizeProduct)
    : [];

  return {
    content,
    page: toNumber(value?.page),
    size:
      toNumber(value?.size) ||
      content.length,
    totalElements: toNumber(
      value?.totalElements
    ),
    totalPages: toNumber(
      value?.totalPages
    ),
    first: value?.first,
    last: value?.last,
  };
}

export async function listAdminProducts(
  page = 0,
  size = 20
): Promise<AdminProductPage> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sort", "createdAt,desc");

  const response = await apiRequest(
    `/api/v1/products?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return normalizePage(
    unwrap<any>(response)
  );
}

export async function getAdminProduct(
  productId: number
): Promise<AdminProduct> {
  const response = await apiRequest(
    `/api/v1/products/${productId}`,
    {
      method: "GET",
    }
  );

  return normalizeProduct(
    unwrap<any>(response)
  );
}

export async function getAdminProductDetails(
  productId: number
): Promise<any> {
  const response = await apiRequest(
    `/api/v1/products/${productId}/details`,
    {
      method: "GET",
    }
  );

  return unwrap<any>(response);
}

export async function createAdminProduct(
  payload: any
): Promise<AdminProduct> {
  const response = await apiRequest(
    "/api/v1/products",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return normalizeProduct(
    unwrap<any>(response)
  );
}

export async function updateAdminProduct(
  productId: number,
  payload: any
): Promise<AdminProduct> {
  const response = await apiRequest(
    `/api/v1/products/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );

  return normalizeProduct(
    unwrap<any>(response)
  );
}

export async function deactivateAdminProduct(
  productId: number
): Promise<void> {
  await apiRequest(
    `/api/v1/products/${productId}`,
    {
      method: "DELETE",
    }
  );
}

export async function restoreAdminProduct(
  productId: number
): Promise<AdminProduct> {
  const response = await apiRequest(
    `/api/v1/products/${productId}/restore`,
    {
      method: "PATCH",
    }
  );

  return normalizeProduct(
    unwrap<any>(response)
  );
}