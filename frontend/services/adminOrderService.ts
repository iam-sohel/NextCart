import { apiRequest } from "@/lib/api";

function asRecord(value: unknown): Record<string, unknown> {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function asText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

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

function unwrap<T>(response: unknown): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
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

function toNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function normalizeOrderItem(
  value: unknown
): AdminOrderItem {
  const record = asRecord(value);
  return {
    id: toNumber(record.id),
    productVariantId: toNumber(
      record.productVariantId
    ),
    productName: asText(record.productName),
    sku: asText(record.sku),
    quantity: toNumber(record.quantity),
    unitMrp: toNumber(record.unitMrp),
    unitSellingPrice: toNumber(
      record.unitSellingPrice
    ),
    discountAmount: toNumber(
      record.discountAmount
    ),
    lineTotal: toNumber(record.lineTotal),
  };
}

function normalizeOrder(
  value: unknown
): AdminOrder {
  const record = asRecord(value);
  return {
    id: toNumber(record.id),
    orderNumber: asText(record.orderNumber),
    status: asText(record.status),

    paymentMethod: asText(record.paymentMethod),
    paymentStatus: asText(record.paymentStatus),
    paymentExpiresAt:
      asNullableText(record.paymentExpiresAt),

    shippingFullName:
      asText(record.shippingFullName),
    shippingPhoneNumber:
      asText(record.shippingPhoneNumber),
    shippingStreetAddress:
      asText(record.shippingStreetAddress),
    shippingLandmark:
      asText(record.shippingLandmark),
    shippingCity:
      asText(record.shippingCity),
    shippingState:
      asText(record.shippingState),
    shippingPostalCode:
      asText(record.shippingPostalCode),
    shippingCountry:
      asText(record.shippingCountry),

    subtotal: toNumber(record.subtotal),
    discountAmount: toNumber(
      record.discountAmount
    ),
    shippingCharge: toNumber(
      record.shippingCharge
    ),
    taxAmount: toNumber(record.taxAmount),
    totalAmount: toNumber(
      record.totalAmount
    ),
    currency: asText(record.currency, "INR"),

    items: Array.isArray(record.items)
      ? record.items.map(normalizeOrderItem)
      : [],

    createdAt: asText(record.createdAt),
    updatedAt: asText(record.updatedAt),
  };
}

function normalizePage(
  value: unknown
): AdminOrderPage {
  const record = asRecord(value);
  const content = Array.isArray(record.content)
    ? record.content.map(normalizeOrder)
    : [];

  return {
    content,
    page: toNumber(record.page),
    size:
      toNumber(record.size) ||
      content.length,
    totalElements: toNumber(
      record.totalElements
    ),
    totalPages: toNumber(
      record.totalPages
    ),
    first: asOptionalBoolean(record.first),
    last: asOptionalBoolean(record.last),
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

  throwIfFailed(response, "Unable to load orders.");

  return normalizePage(
    unwrap<unknown>(response)
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

  throwIfFailed(response, "Unable to load order.");

  return normalizeOrder(
    unwrap<unknown>(response)
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

  throwIfFailed(response, "Unable to update order status.");

  return normalizeOrder(
    unwrap<unknown>(response)
  );
}