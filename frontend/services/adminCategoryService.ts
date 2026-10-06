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

interface CategoryApiResponse {
    id?: number | string;
    name?: string;
    status?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

interface CategoryPageApiResponse {
    content?: CategoryApiResponse[];
    page?: number | string;
    size?: number | string;
    totalElements?: number | string;
    totalPages?: number | string;
    first?: boolean;
    last?: boolean;
}

interface BackendResponse<T> {
    data?: T;
}

function normalizeCategory(
    value: CategoryApiResponse
): AdminCategory {
    return {
        id: Number(value.id ?? 0),
        name: value.name ?? "",
        status: value.status ?? "",
        createdAt: value.createdAt ?? null,
        updatedAt: value.updatedAt ?? null,
    };
}

function normalizePage(
    value: CategoryPageApiResponse
): AdminCategoryPage {
    const content = Array.isArray(value.content)
        ? value.content.map(normalizeCategory)
        : [];

    return {
        content,
        page: Number(value.page ?? 0),
        size: Number(value.size ?? content.length),
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

function getData<T>(response: BackendResponse<T>): T {
    if (response.data === undefined) {
        throw new Error("Invalid API response");
    }

    return response.data;
}

// ─────────────────────────────────────────────
// LIST CATEGORIES
// ─────────────────────────────────────────────

export async function listAdminCategories(
    page = 0,
    size = 20
): Promise<AdminCategoryPage> {
    const response = await apiRequest<
        BackendResponse<CategoryPageApiResponse>
    >(
        `/api/v1/admin/categories?page=${page}&size=${size}&sort=name,asc`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message || "Failed to load categories"
        );
    }

    const data = getData(response.data);

    return normalizePage(data);
}

// ─────────────────────────────────────────────
// GET CATEGORY
// ─────────────────────────────────────────────

export async function getAdminCategory(
    id: number
): Promise<AdminCategory> {
    const response = await apiRequest<
        BackendResponse<CategoryApiResponse>
    >(
        `/api/v1/admin/categories/${id}`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message || "Failed to load category"
        );
    }

    const data = getData(response.data);

    return normalizeCategory(data);
}

// ─────────────────────────────────────────────
// CREATE CATEGORY
// ─────────────────────────────────────────────

export async function createAdminCategory(
    name: string
): Promise<AdminCategory> {
    const response = await apiRequest<
        BackendResponse<CategoryApiResponse>
    >(
        `/api/v1/admin/categories`,
        {
            method: "POST",
            body: {
                name: name.trim(),
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message || "Failed to create category"
        );
    }

    const data = getData(response.data);

    return normalizeCategory(data);
}

// ─────────────────────────────────────────────
// UPDATE CATEGORY
// ─────────────────────────────────────────────

export async function updateAdminCategory(
    id: number,
    name: string
): Promise<AdminCategory> {
    const response = await apiRequest<
        BackendResponse<CategoryApiResponse>
    >(
        `/api/v1/admin/categories/${id}`,
        {
            method: "PUT",
            body: {
                name: name.trim(),
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message || "Failed to update category"
        );
    }

    const data = getData(response.data);

    return normalizeCategory(data);
}

// ─────────────────────────────────────────────
// DEACTIVATE CATEGORY
// ─────────────────────────────────────────────

export async function deactivateAdminCategory(
    id: number
): Promise<void> {
    const response = await apiRequest<void>(
        `/api/v1/admin/categories/${id}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message || "Failed to deactivate category"
        );
    }
}

// ─────────────────────────────────────────────
// RESTORE CATEGORY
// ─────────────────────────────────────────────

export async function restoreAdminCategory(
    id: number
): Promise<AdminCategory> {
    const response = await apiRequest<
        BackendResponse<CategoryApiResponse>
    >(
        `/api/v1/admin/categories/${id}/restore`,
        {
            method: "PATCH",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message || "Failed to restore category"
        );
    }

    const data = getData(response.data);

    return normalizeCategory(data);
}