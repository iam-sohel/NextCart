import { apiRequest } from "@/lib/api";

export interface AdminCustomer {
  customerId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  active: boolean;
}

export interface AdminCustomerPage {
  content: AdminCustomer[];
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

/**
 * Throw on transport/API failure so a failed request can never be mistaken
 * for an empty dataset. All existing consumers already handle thrown errors
 * with try/catch, so signatures stay unchanged.
 */
function throwIfFailed(
  response: { ok: boolean; message?: string },
  fallback: string,
): void {
  if (!response.ok) {
    throw new Error(response.message || fallback);
  }
}

function normalizeCustomer(value: any): AdminCustomer {
  return {
    customerId: Number(value?.customerId ?? 0),
    userId: Number(value?.userId ?? 0),
    firstName: value?.firstName ?? "",
    lastName: value?.lastName ?? "",
    email: value?.email ?? "",
    phone: value?.phone ?? "",
    active: Boolean(value?.active),
  };
}

function normalizePage(value: any): AdminCustomerPage {
  const content = Array.isArray(value?.content)
    ? value.content.map(normalizeCustomer)
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

export async function listAdminCustomers(
  page = 0,
  size = 20
): Promise<AdminCustomerPage> {
  const response = await apiRequest(
    `/api/v1/admin/customers?page=${page}&size=${size}&sort=customerId,desc`,
    {
      method: "GET",
    }
  );

  throwIfFailed(response, "Unable to load customers.");

  return normalizePage(unwrap<any>(response));
}

export async function getAdminCustomer(
  customerId: number
): Promise<AdminCustomer> {
  const response = await apiRequest(
    `/api/v1/admin/customers/${customerId}`,
    {
      method: "GET",
    }
  );

  throwIfFailed(response, "Unable to load customer.");

  return normalizeCustomer(unwrap<any>(response));
}

export async function activateAdminCustomer(
  customerId: number
): Promise<void> {
  const response = await apiRequest(
    `/api/v1/admin/customers/${customerId}/activate`,
    {
      method: "PUT",
    }
  );

  throwIfFailed(response, "Unable to activate customer.");
}

export async function deactivateAdminCustomer(
  customerId: number
): Promise<void> {
  const response = await apiRequest(
    `/api/v1/admin/customers/${customerId}/deactivate`,
    {
      method: "PUT",
    }
  );

  throwIfFailed(response, "Unable to deactivate customer.");
}