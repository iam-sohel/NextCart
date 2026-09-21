import { apiRequest } from "@/lib/api";

export interface AdminOrderItem {
  id: number;
  productVariantId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitMrp: number;
  unitSellingPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  status: string;

  paymentMethod: string;
  paymentStatus: string;
  paymentExpiresAt: string | null;

  shippingFullName: string;
  shippingPhoneNumber: string;
  shippingStreetAddress: string;
  shippingLandmark: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;

  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;

  items: AdminOrderItem[];

  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderPage {
  content: AdminOrder[];
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

function normalizeOrderItem(
  value: any
): AdminOrderItem {
  return {
    id: toNumber(value?.id),
    productVariantId: toNumber(
      value?.productVariantId
    ),
    productName: value?.productName ?? "",
    sku: value?.sku ?? "",
    quantity: toNumber(value?.quantity),
    unitMrp: toNumber(value?.unitMrp),
    unitSellingPrice: toNumber(
      value?.unitSellingPrice
    ),
    discountAmount: toNumber(
      value?.discountAmount
    ),
    lineTotal: toNumber(value?.lineTotal),
  };
}

function normalizeOrder(
  value: any
): AdminOrder {
  return {
    id: toNumber(value?.id),
    orderNumber: value?.orderNumber ?? "",
    status: value?.status ?? "",

    paymentMethod: value?.paymentMethod ?? "",
    paymentStatus: value?.paymentStatus ?? "",
    paymentExpiresAt:
      value?.paymentExpiresAt ?? null,

    shippingFullName:
      value?.shippingFullName ?? "",
    shippingPhoneNumber:
      value?.shippingPhoneNumber ?? "",
    shippingStreetAddress:
      value?.shippingStreetAddress ?? "",
    shippingLandmark:
      value?.shippingLandmark ?? "",
    shippingCity:
      value?.shippingCity ?? "",
    shippingState:
      value?.shippingState ?? "",
    shippingPostalCode:
      value?.shippingPostalCode ?? "",
    shippingCountry:
      value?.shippingCountry ?? "",

    subtotal: toNumber(value?.subtotal),
    discountAmount: toNumber(
      value?.discountAmount
    ),
    shippingCharge: toNumber(
      value?.shippingCharge
    ),
    taxAmount: toNumber(value?.taxAmount),
    totalAmount: toNumber(
      value?.totalAmount
    ),
    currency: value?.currency ?? "INR",

    items: Array.isArray(value?.items)
      ? value.items.map(normalizeOrderItem)
      : [],

    createdAt: value?.createdAt ?? "",
    updatedAt: value?.updatedAt ?? "",
  };
}

function normalizePage(
  value: any
): AdminOrderPage {
  const content = Array.isArray(value?.content)
    ? value.content.map(normalizeOrder)
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

export async function listAdminOrders(
  page = 0,
  size = 20,
  status?: string
): Promise<AdminOrderPage> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sort", "createdAt,desc");

  if (status) {
    params.set("status", status);
  }

  const response = await apiRequest(
    `/api/v1/admin/orders?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return normalizePage(
    unwrap<any>(response)
  );
}

export async function getAdminOrder(
  orderId: number
): Promise<AdminOrder> {
  const response = await apiRequest(
    `/api/v1/admin/orders/${orderId}`,
    {
      method: "GET",
    }
  );

  return normalizeOrder(
    unwrap<any>(response)
  );
}

export async function updateAdminOrderStatus(
  orderId: number,
  status: string
): Promise<AdminOrder> {
  const params = new URLSearchParams();

  params.set("status", status);

  const response = await apiRequest(
    `/api/v1/admin/orders/${orderId}/status?${params.toString()}`,
    {
      method: "PUT",
    }
  );

  return normalizeOrder(
    unwrap<any>(response)
  );
}