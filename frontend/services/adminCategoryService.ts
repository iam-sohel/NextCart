import { apiRequest } from "@/lib/api";

export interface AdminCategory {
  id: number;
  name: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminCategoryPage {
  content: AdminCategory[];
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

function normalizeCategory(value: any): AdminCategory {
  return {
    id: Number(value?.id ?? 0),
    name: value?.name ?? "",
    status: value?.status ?? "",
    createdAt: value?.createdAt ?? null,
    updatedAt: value?.updatedAt ?? null,
  };
}

function normalizePage(value: any): AdminCategoryPage {
  const content = Array.isArray(value?.content)
    ? value.content.map(normalizeCategory)
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

export async function listAdminCategories(
  page = 0,
  size = 20
): Promise<AdminCategoryPage> {
  const response = await apiRequest(
    `/api/v1/admin/categories?page=${page}&size=${size}&sort=name,asc`,
    {
      method: "GET",
    }
  );

  return normalizePage(unwrap<any>(response));
}

export async function getAdminCategory(
  id: number
): Promise<AdminCategory> {
  const response = await apiRequest(
    `/api/v1/admin/categories/${id}`,
    {
      method: "GET",
    }
  );

  return normalizeCategory(unwrap<any>(response));
}

export async function createAdminCategory(
  name: string
): Promise<AdminCategory> {
  const response = await apiRequest(
    `/api/v1/admin/categories`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  );

  return normalizeCategory(unwrap<any>(response));
}

export async function updateAdminCategory(
  id: number,
  name: string
): Promise<AdminCategory> {
  const response = await apiRequest(
    `/api/v1/admin/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ name }),
    }
  );

  return normalizeCategory(unwrap<any>(response));
}

export async function deactivateAdminCategory(
  id: number
): Promise<void> {
  await apiRequest(
    `/api/v1/admin/categories/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function restoreAdminCategory(
  id: number
): Promise<AdminCategory> {
  const response = await apiRequest(
    `/api/v1/admin/categories/${id}/restore`,
    {
      method: "PATCH",
    }
  );

  return normalizeCategory(unwrap<any>(response));
}