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

  return normalizeCustomer(unwrap<any>(response));
}

export async function activateAdminCustomer(
  customerId: number
): Promise<void> {
  await apiRequest(
    `/api/v1/admin/customers/${customerId}/activate`,
    {
      method: "PUT",
    }
  );
}

export async function deactivateAdminCustomer(
  customerId: number
): Promise<void> {
  await apiRequest(
    `/api/v1/admin/customers/${customerId}/deactivate`,
    {
      method: "PUT",
    }
  );
}