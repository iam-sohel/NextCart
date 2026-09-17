/**
 * NEXTCART — Public catalog service boundary.
 *
 * Read-only lookups used by the seller product form to populate
 * category / subcategory / brand selects. These are the existing public
 * catalog endpoints (the same ones the storefront uses).
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export interface Category {
  id: number;
  name: string;
  status?: string;
}

export interface SubCategory {
  id: number;
  name: string;
  status?: string;
}

export interface Brand {
  id: number;
  name: string;
  status?: string;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface Page<T> {
  content?: T[];
}

function extractList<T>(payload: unknown): T[] {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as Envelope<unknown>).data
      : payload;

  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const content = (data as Page<T>).content;
    if (Array.isArray(content)) return content;
  }

  return [];
}

/** GET /api/v1/categories */
export async function listCategories(
  signal?: AbortSignal,
): Promise<ApiResult<Category[]>> {
  const res = await apiRequest<unknown>("/api/v1/categories", {
    method: "GET",
    signal,
  });
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: extractList<Category>(res.data) };
}

/** GET /api/v1/subcategories/category/{categoryId} */
export async function listSubCategories(
  categoryId: number,
  signal?: AbortSignal,
): Promise<ApiResult<SubCategory[]>> {
  const res = await apiRequest<unknown>(
    `/api/v1/subcategories/category/${categoryId}`,
    { method: "GET", signal },
  );
  if (!res.ok) return res;
  return {
    ok: true,
    status: res.status,
    data: extractList<SubCategory>(res.data),
  };
}

/** GET /api/v1/brands */
export async function listBrands(
  signal?: AbortSignal,
): Promise<ApiResult<Brand[]>> {
  const res = await apiRequest<unknown>("/api/v1/brands", {
    method: "GET",
    signal,
  });
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: extractList<Brand>(res.data) };
}

export type { ApiResult };
