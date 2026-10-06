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

interface BrandApiResponse {
  id?: number | string;
  name?: string;
  status?: string;
}

interface BrandPageResponse {
  content?: BrandApiResponse[];
  page?: number | string;
  size?: number | string;
  totalElements?: number | string;
  totalPages?: number | string;
  first?: boolean;
  last?: boolean;
}

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function unwrapData<T>(
    payload: BackendEnvelope<T> | T
): T {
  if (
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      payload.data !== undefined
  ) {
    return payload.data as T;
  }

  return payload as T;
}

function normalizeBrand(
    value: BrandApiResponse
): AdminBrand {
  return {
    id: Number(value.id ?? 0),
    name: value.name ?? "",
    status: value.status ?? "",
  };
}

function normalizePage(
    value: BrandPageResponse
): AdminBrandPage {
  const content = Array.isArray(value.content)
      ? value.content.map(normalizeBrand)
      : [];

  return {
    content,
    page: Number(value.page ?? 0),
    size: Number(
        value.size ?? content.length
    ),
    totalElements: Number(
        value.totalElements ?? content.length
    ),
    totalPages: Number(
        value.totalPages ??
        (content.length > 0 ? 1 : 0)
    ),
    first: value.first,
    last: value.last,
  };
}

export async function listAdminBrands(
    page = 0,
    size = 20
): Promise<AdminBrandPage> {
  const response = await apiRequest<
      BackendEnvelope<BrandPageResponse>
  >(
      `/api/v1/admin/brands?page=${page}&size=${size}&sort=name,asc`,
      {
        method: "GET",
      }
  );

  if (!response.ok) {
    throw new Error(
        response.message ||
        "Failed to load brands"
    );
  }

  const pageData = unwrapData(
      response.data
  );

  return normalizePage(pageData);
}

export async function getAdminBrand(
    id: number
): Promise<AdminBrand> {
  const response = await apiRequest<
      BackendEnvelope<BrandApiResponse>
  >(
      `/api/v1/admin/brands/${id}`,
      {
        method: "GET",
      }
  );

  if (!response.ok) {
    throw new Error(
        response.message ||
        "Failed to load brand"
    );
  }

  const brandData = unwrapData(
      response.data
  );

  return normalizeBrand(brandData);
}

export async function createAdminBrand(
    name: string
): Promise<AdminBrand> {
  const response = await apiRequest<
      BackendEnvelope<BrandApiResponse>
  >(
      "/api/v1/admin/brands",
      {
        method: "POST",
        body: {
          name: name.trim(),
        },
      }
  );

  if (!response.ok) {
    throw new Error(
        response.message ||
        "Failed to create brand"
    );
  }

  const brandData = unwrapData(
      response.data
  );

  return normalizeBrand(brandData);
}

export async function updateAdminBrand(
    id: number,
    name: string
): Promise<AdminBrand> {
  const response = await apiRequest<
      BackendEnvelope<BrandApiResponse>
  >(
      `/api/v1/admin/brands/${id}`,
      {
        method: "PUT",
        body: {
          name: name.trim(),
        },
      }
  );

  if (!response.ok) {
    throw new Error(
        response.message ||
        "Failed to update brand"
    );
  }

  const brandData = unwrapData(
      response.data
  );

  return normalizeBrand(brandData);
}

export async function deactivateAdminBrand(
    id: number
): Promise<void> {
  const response = await apiRequest<void>(
      `/api/v1/admin/brands/${id}`,
      {
        method: "DELETE",
      }
  );

  if (!response.ok) {
    throw new Error(
        response.message ||
        "Failed to deactivate brand"
    );
  }
}

export async function restoreAdminBrand(
    id: number
): Promise<AdminBrand> {
  const response = await apiRequest<
      BackendEnvelope<BrandApiResponse>
  >(
      `/api/v1/admin/brands/${id}/restore`,
      {
        method: "PATCH",
      }
  );

  if (!response.ok) {
    throw new Error(
        response.message ||
        "Failed to restore brand"
    );
  }

  const brandData = unwrapData(
      response.data
  );

  return normalizeBrand(brandData);
}
