import { apiRequest } from "@/lib/api";

export interface AdminBrand {
  id: number;
  name: string;
  status: string;
}

export interface AdminBrandPage {
  content: AdminBrand[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

function unwrap<T>(response: any): T {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }

  return response as T;
}

function normalizeBrand(value: any): AdminBrand {
  return {
    id: Number(value?.id ?? 0),
    name: value?.name ?? "",
    status: value?.status ?? "",
  };
}

function normalizePage(value: any): AdminBrandPage {
  const content = Array.isArray(value?.content)
    ? value.content.map(normalizeBrand)
    : [];

  return {
    content,
    page: Number(value?.page ?? 0),
    size: Number(value?.size ?? content.length),
    totalElements: Number(value?.totalElements ?? content.length),
    totalPages: Number(
      value?.totalPages ?? (content.length > 0 ? 1 : 0)
    ),
    first: value?.first,
    last: value?.last,
  };
}

export async function listAdminBrands(
  page = 0,
  size = 20
): Promise<AdminBrandPage> {
  const response = await apiRequest(
    `/api/v1/admin/brands?page=${page}&size=${size}&sort=name,asc`,
    {
      method: "GET",
    }
  );

  return normalizePage(unwrap<any>(response));
}

export async function getAdminBrand(
  id: number
): Promise<AdminBrand> {
  const response = await apiRequest(
    `/api/v1/admin/brands/${id}`,
    {
      method: "GET",
    }
  );

  return normalizeBrand(unwrap<any>(response));
}

export async function createAdminBrand(
  name: string
): Promise<AdminBrand> {
  const response = await apiRequest(
    `/api/v1/admin/brands`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  );

  return normalizeBrand(unwrap<any>(response));
}

export async function updateAdminBrand(
  id: number,
  name: string
): Promise<AdminBrand> {
  const response = await apiRequest(
    `/api/v1/admin/brands/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ name }),
    }
  );

  return normalizeBrand(unwrap<any>(response));
}

export async function deactivateAdminBrand(
  id: number
): Promise<void> {
  await apiRequest(
    `/api/v1/admin/brands/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function restoreAdminBrand(
  id: number
): Promise<AdminBrand> {
  const response = await apiRequest(
    `/api/v1/admin/brands/${id}/restore`,
    {
      method: "PATCH",
    }
  );

  return normalizeBrand(unwrap<any>(response));
}