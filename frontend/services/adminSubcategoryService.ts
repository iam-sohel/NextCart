import { apiRequest } from "@/lib/api";

export interface AdminSubcategory {
    id: number;
    name: string;
    status: string;
    categoryId: number;
    categoryName: string;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface AdminSubcategoryPage {
    content: AdminSubcategory[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first?: boolean;
    last?: boolean;
}

interface SubcategoryApiResponse {
    id?: number | string;
    name?: string;
    status?: string;
    categoryId?: number | string;
    categoryName?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

interface SubcategoryPageResponse {
    content?: SubcategoryApiResponse[];
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

function getData<T>(response: BackendResponse<T>): T {
    if (response.data === undefined) {
        throw new Error("Invalid API response");
    }

    return response.data;
}

function normalizeSubcategory(
    value: SubcategoryApiResponse
): AdminSubcategory {
    return {
        id: Number(value.id ?? 0),
        name: value.name ?? "",
        status: value.status ?? "",
        categoryId: Number(value.categoryId ?? 0),
        categoryName: value.categoryName ?? "",
        createdAt: value.createdAt ?? null,
        updatedAt: value.updatedAt ?? null,
    };
}

function normalizePage(
    value: SubcategoryPageResponse
): AdminSubcategoryPage {
    const content = Array.isArray(value.content)
        ? value.content.map(normalizeSubcategory)
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

// Get all subcategories
export async function listAdminSubcategories(
    page = 0,
    size = 20
): Promise<AdminSubcategoryPage> {
    const response = await apiRequest<
        BackendResponse<SubcategoryPageResponse>
    >(
        `/api/v1/admin/subcategories?page=${page}&size=${size}&sort=name,asc`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message || "Failed to load subcategories"
        );
    }

    return normalizePage(getData(response.data));
}

// Get subcategories by category
export async function listAdminSubcategoriesByCategory(
    categoryId: number
): Promise<AdminSubcategory[]> {
    const response = await apiRequest<
        BackendResponse<SubcategoryApiResponse[]>
    >(
        `/api/v1/admin/subcategories/category/${categoryId}`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message ||
            "Failed to load subcategories"
        );
    }

    const data = getData(response.data);

    return Array.isArray(data)
        ? data.map(normalizeSubcategory)
        : [];
}

// Get subcategory by ID
export async function getAdminSubcategory(
    id: number
): Promise<AdminSubcategory> {
    const response = await apiRequest<
        BackendResponse<SubcategoryApiResponse>
    >(
        `/api/v1/admin/subcategories/${id}`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message ||
            "Failed to load subcategory"
        );
    }

    return normalizeSubcategory(
        getData(response.data)
    );
}

// Create subcategory
export async function createAdminSubcategory(
    name: string,
    categoryId: number
): Promise<AdminSubcategory> {
    const response = await apiRequest<
        BackendResponse<SubcategoryApiResponse>
    >(
        `/api/v1/admin/subcategories`,
        {
            method: "POST",
            body: {
                name: name.trim(),
                categoryId,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message ||
            "Failed to create subcategory"
        );
    }

    return normalizeSubcategory(
        getData(response.data)
    );
}

// Update subcategory
export async function updateAdminSubcategory(
    id: number,
    name: string,
    categoryId: number
): Promise<AdminSubcategory> {
    const response = await apiRequest<
        BackendResponse<SubcategoryApiResponse>
    >(
        `/api/v1/admin/subcategories/${id}`,
        {
            method: "PUT",
            body: {
                name: name.trim(),
                categoryId,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message ||
            "Failed to update subcategory"
        );
    }

    return normalizeSubcategory(
        getData(response.data)
    );
}

// Deactivate subcategory
export async function deactivateAdminSubcategory(
    id: number
): Promise<void> {
    const response = await apiRequest<void>(
        `/api/v1/admin/subcategories/${id}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message ||
            "Failed to deactivate subcategory"
        );
    }
}

// Restore subcategory
export async function restoreAdminSubcategory(
    id: number
): Promise<AdminSubcategory> {
    const response = await apiRequest<
        BackendResponse<SubcategoryApiResponse>
    >(
        `/api/v1/admin/subcategories/${id}/restore`,
        {
            method: "PATCH",
        }
    );

    if (!response.ok) {
        throw new Error(
            response.message ||
            "Failed to restore subcategory"
        );
    }

    return normalizeSubcategory(
        getData(response.data)
    );
}