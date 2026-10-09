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

function asNullableText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asKycStatus(value: unknown): KycStatus {
  if (
    value === "PENDING" ||
    value === "UNDER_REVIEW" ||
    value === "VERIFIED" ||
    value === "REJECTED"
  ) {
    return value;
  }

  return "PENDING";
}

export type KycStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export interface AdminSellerKyc {
  id: number;
  sellerId: number;

  businessType?: string | null;

  gstNumber?: string | null;
  gstDocumentUrl?: string | null;

  registrationNumber?: string | null;
  registrationDocumentUrl?: string | null;

  ownerName?: string | null;
  dateOfBirth?: string | null;

  panNumber?: string | null;
  panDocumentUrl?: string | null;

  aadhaarNumber?: string | null;
  aadhaarDocumentUrl?: string | null;

  businessAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;

  addressDocumentUrl?: string | null;

  status: KycStatus;
  rejectionReason?: string | null;

  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: number | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminSellerKycPage {
  content: AdminSellerKyc[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

const ENDPOINTS = {
  all: "/api/v1/admin/sellers/kyc",
  pending: "/api/v1/admin/sellers/kyc/pending",
};

function unwrap<T>(response: unknown): T {
  // Handle the apiRequest() result wrapper.
  const apiResult = asRecord(response);

  const payload =
    apiResult.ok === true && "data" in apiResult
      ? apiResult.data
      : response;

  // Handle the backend CommonResponse envelope.
  const envelope = asRecord(payload);

  if (
    envelope.success === true &&
    "data" in envelope
  ) {
    return envelope.data as T;
  }

  return payload as T;
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

function normaliseKyc(value: unknown): AdminSellerKyc {
  const record = asRecord(value);
  return {
    id: Number(record.id ?? 0),
    sellerId: Number(record.sellerId ?? 0),

    businessType: asNullableText(record.businessType),

    gstNumber: asNullableText(record.gstNumber),
    gstDocumentUrl: asNullableText(record.gstDocumentUrl),

    registrationNumber:
      asNullableText(record.registrationNumber),
    registrationDocumentUrl:
      asNullableText(record.registrationDocumentUrl),

    ownerName: asNullableText(record.ownerName),
    dateOfBirth: asNullableText(record.dateOfBirth),

    panNumber: asNullableText(record.panNumber),
    panDocumentUrl:
      asNullableText(record.panDocumentUrl),

    aadhaarNumber:
      asNullableText(record.aadhaarNumber),
    aadhaarDocumentUrl:
      asNullableText(record.aadhaarDocumentUrl),

    businessAddress:
      asNullableText(record.businessAddress),

    city: asNullableText(record.city),
    state: asNullableText(record.state),
    postalCode:
      asNullableText(record.postalCode),
    country:
      asNullableText(record.country),

    addressDocumentUrl:
      asNullableText(record.addressDocumentUrl),

    status:
      asKycStatus(record.status),

    rejectionReason:
      asNullableText(record.rejectionReason),

    submittedAt:
      asNullableText(record.submittedAt),

    reviewedAt:
      asNullableText(record.reviewedAt),

    reviewedBy:
      record.reviewedBy == null
        ? null
        : Number(record.reviewedBy),

    createdAt:
      asNullableText(record.createdAt),

    updatedAt:
      asNullableText(record.updatedAt),
  };
}

function normalisePage(value: unknown): AdminSellerKycPage {
  const record = asRecord(value);
  const content = Array.isArray(record.content)
    ? record.content.map(normaliseKyc)
    : [];

  return {
    content,

    page: Number(record.page ?? 0),

    size: Number(
      record.size ?? content.length,
    ),

    totalElements: Number(
      record.totalElements ?? content.length,
    ),

    totalPages: Number(
      record.totalPages ??
        (content.length ? 1 : 0),
    ),

    first: asOptionalBoolean(record.first),
    last: asOptionalBoolean(record.last),
  };
}

function query(page: number, size: number) {
  return `?page=${page}&size=${size}`;
}

export async function listAdminKyc(
  options: {
    pendingOnly?: boolean;
    page?: number;
    size?: number;
  } = {},
): Promise<AdminSellerKycPage> {
  const page = options.page ?? 0;
  const size = options.size ?? 20;

  const endpoint = options.pendingOnly
    ? ENDPOINTS.pending
    : ENDPOINTS.all;

  const response = await apiRequest(
    `${endpoint}${query(page, size)}`,
    {
      method: "GET",
    },
  );

  throwIfFailed(response, "Unable to load seller KYC.");

  return normalisePage(
    unwrap<unknown>(response),
  );
}

export async function getAdminKyc(
  sellerId: number | string,
): Promise<AdminSellerKyc> {
  const response = await apiRequest(
    `/api/v1/admin/sellers/${sellerId}/kyc`,
    {
      method: "GET",
    },
  );

  throwIfFailed(response, "Unable to load seller KYC.");

  return normaliseKyc(
    unwrap<unknown>(response),
  );
}

export async function approveAdminKyc(
  sellerId: number | string,
): Promise<void> {
  const response = await apiRequest(
    `/api/v1/admin/sellers/${sellerId}/kyc/approve`,
    {
      method: "PUT",
    },
  );

  throwIfFailed(response, "Unable to approve seller KYC.");
}

export async function rejectAdminKyc(
  sellerId: number | string,
  rejectionReason: string,
): Promise<void> {
  const reason = rejectionReason.trim();

  if (!reason) {
    throw new Error(
      "Rejection reason is required.",
    );
  }

  const response = await apiRequest(
    `/api/v1/admin/sellers/${sellerId}/kyc/reject`,
    {
      method: "PUT",
      body: {
        rejectionReason: reason,
      },
    },
  );

  throwIfFailed(response, "Unable to reject seller KYC.");
}
