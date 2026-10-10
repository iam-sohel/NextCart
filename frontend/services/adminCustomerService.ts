import { apiRequest } from "@/lib/api";

type UnknownRecord = Record<string, unknown>;

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

function asRecord(value: unknown, context: string): UnknownRecord {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(`Invalid API response: ${context} must be an object.`);
  }

  return value as UnknownRecord;
}

function asText(value: unknown, context: string): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid API response: ${context} must be a string.`);
  }

  return value;
}

function asPositiveInteger(value: unknown, context: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid API response: ${context} must be a positive integer.`,
    );
  }

  return parsed;
}

function asNonNegativeInteger(value: unknown, context: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(
      `Invalid API response: ${context} must be a non-negative integer.`,
    );
  }

  return parsed;
}

function asBoolean(value: unknown, context: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid API response: ${context} must be a boolean.`);
  }

  return value;
}

function asOptionalBoolean(
  record: UnknownRecord,
  key: "first" | "last",
): boolean | undefined {
  if (!(key in record) || record[key] === undefined) {
    return undefined;
  }

  return asBoolean(record[key], key);
}

/**
 * apiRequest returns an ApiResult. Its successful data contains the
 * backend's CommonResponseDto envelope.
 */
function unwrapBackendData<T>(response: unknown): T {
  const result = asRecord(response, "transport result");

  if (result.ok !== true) {
    const message =
      typeof result.message === "string" && result.message.trim()
        ? result.message
        : "The request failed.";

    throw new Error(message);
  }

  if (!("data" in result)) {
    throw new Error("Invalid API response: transport data is missing.");
  }

  const envelope = asRecord(result.data, "response envelope");

  if (typeof envelope.success !== "boolean") {
    throw new Error("Invalid API response: success flag is missing.");
  }

  if (!envelope.success) {
    const message =
      typeof envelope.message === "string" && envelope.message.trim()
        ? envelope.message
        : "The API reported a failure.";

    throw new Error(message);
  }

  if (!("data" in envelope)) {
    throw new Error("Invalid API response: envelope data is missing.");
  }

  return envelope.data as T;
}

function normalizeCustomer(value: unknown): AdminCustomer {
  const record = asRecord(value, "customer");

  return {
    customerId: asPositiveInteger(record.customerId, "customerId"),
    userId: asPositiveInteger(record.userId, "userId"),
    firstName: asText(record.firstName, "firstName"),
    lastName: asText(record.lastName, "lastName"),
    email: asText(record.email, "email"),
    phone: asText(record.phone, "phone"),
    active: asBoolean(record.active, "active"),
  };
}

function normalizePage(value: unknown): AdminCustomerPage {
  const record = asRecord(value, "customer page");

  if (!Array.isArray(record.content)) {
    throw new Error(
      "Invalid API response: customer page content must be an array.",
    );
  }

  const content = record.content.map(normalizeCustomer);
  const pageValue = record.number ?? record.page;

  const page = asNonNegativeInteger(pageValue, "page number");
  const size = asNonNegativeInteger(record.size, "page size");
  const totalElements = asNonNegativeInteger(
    record.totalElements,
    "totalElements",
  );
  const totalPages = asNonNegativeInteger(record.totalPages, "totalPages");

  if (size === 0 && totalElements > 0) {
    throw new Error(
      "Invalid API response: page size cannot be zero when records exist.",
    );
  }

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    first: asOptionalBoolean(record, "first"),
    last: asOptionalBoolean(record, "last"),
  };
}

function validateCustomerId(customerId: number): void {
  if (!Number.isSafeInteger(customerId) || customerId <= 0) {
    throw new Error(
      "Invalid customer ID. A positive integer is required.",
    );
  }
}

function validatePagination(page: number, size: number): void {
  if (!Number.isSafeInteger(page) || page < 0) {
    throw new Error(
      "Invalid page number. A non-negative integer is required.",
    );
  }

  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new Error(
      "Invalid page size. A positive integer is required.",
    );
  }
}

function throwIfFailed(
  response: { ok: boolean; message?: string },
  fallback: string,
): void {
  if (!response.ok) {
    throw new Error(response.message || fallback);
  }
}

export async function listAdminCustomers(
  page = 0,
  size = 20,
): Promise<AdminCustomerPage> {
  validatePagination(page, size);

  const response = await apiRequest(
    `/api/v1/admin/customers?page=${page}&size=${size}&sort=id,desc`,
    { method: "GET" },
  );

  throwIfFailed(response, "Unable to load customers.");

  return normalizePage(unwrapBackendData<unknown>(response));
}

export async function getAdminCustomer(
  customerId: number,
): Promise<AdminCustomer> {
  validateCustomerId(customerId);

  const response = await apiRequest(
    `/api/v1/admin/customers/${customerId}`,
    { method: "GET" },
  );

  throwIfFailed(response, "Unable to load customer.");

  return normalizeCustomer(unwrapBackendData<unknown>(response));
}

export async function activateAdminCustomer(
  customerId: number,
): Promise<void> {
  validateCustomerId(customerId);

  const response = await apiRequest(
    `/api/v1/admin/customers/${customerId}/activate`,
    { method: "PUT" },
  );

  throwIfFailed(response, "Unable to activate customer.");

  unwrapBackendData<null>(response);
}

export async function deactivateAdminCustomer(
  customerId: number,
): Promise<void> {
  validateCustomerId(customerId);

  const response = await apiRequest(
    `/api/v1/admin/customers/${customerId}/deactivate`,
    { method: "PUT" },
  );

  throwIfFailed(response, "Unable to deactivate customer.");

  unwrapBackendData<null>(response);
}
