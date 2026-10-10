import { apiRequest, type ApiResult } from "@/lib/api";

export interface AdminSellerKyc {
  id: number;
  sellerId: number;
  businessType: string | null;

  gstNumber: string | null;
  gstDocumentUrl: string | null;

  registrationNumber: string | null;
  registrationDocumentUrl: string | null;

  ownerName: string | null;
  dateOfBirth: string | null;

  panNumber: string | null;
  panDocumentUrl: string | null;

  aadhaarNumber: string | null;
  aadhaarDocumentUrl: string | null;

  businessAddress: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;

  addressDocumentUrl: string | null;

  status: string | null;
  rejectionReason: string | null;

  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: number | null;

  createdAt: string | null;
  updatedAt: string | null;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function unwrap<T>(payload: unknown, fallback: T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    const envelope = payload as Envelope<T>;

    if (envelope.data !== undefined && envelope.data !== null) {
      return envelope.data;
    }
  }

  return fallback;
}

function toNumber(value: unknown): number | null {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function toText(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function normalizeKyc(value: unknown): AdminSellerKyc | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  const id = toNumber(record.id);
  const sellerId = toNumber(record.sellerId);

  if (!id || id <= 0 || !sellerId || sellerId <= 0) {
    return null;
  }

  return {
    id,
    sellerId,

    businessType: toText(record.businessType),

    gstNumber: toText(record.gstNumber),
    gstDocumentUrl: toText(record.gstDocumentUrl),

    registrationNumber: toText(record.registrationNumber),
    registrationDocumentUrl: toText(record.registrationDocumentUrl),

    ownerName: toText(record.ownerName),
    dateOfBirth: toText(record.dateOfBirth),

    panNumber: toText(record.panNumber),
    panDocumentUrl: toText(record.panDocumentUrl),

    aadhaarNumber: toText(record.aadhaarNumber),
    aadhaarDocumentUrl: toText(record.aadhaarDocumentUrl),

    businessAddress: toText(record.businessAddress),
    city: toText(record.city),
    state: toText(record.state),
    postalCode: toText(record.postalCode),
    country: toText(record.country),

    addressDocumentUrl: toText(record.addressDocumentUrl),

    status: toText(record.status),
    rejectionReason: toText(record.rejectionReason),

    submittedAt: toText(record.submittedAt),
    reviewedAt: toText(record.reviewedAt),
    reviewedBy: toNumber(record.reviewedBy),

    createdAt: toText(record.createdAt),
    updatedAt: toText(record.updatedAt),
  };
}

function validSellerId(sellerId: number): boolean {
  return Number.isInteger(sellerId) && sellerId > 0;
}

const ENDPOINTS = {
  bySellerId: (sellerId: number) =>
    `/api/v1/admin/sellers/${encodeURIComponent(
      String(sellerId)
    )}/kyc`,

  approve: (sellerId: number) =>
    `/api/v1/admin/sellers/${encodeURIComponent(
      String(sellerId)
    )}/kyc/approve`,

  reject: (sellerId: number) =>
    `/api/v1/admin/sellers/${encodeURIComponent(
      String(sellerId)
    )}/kyc/reject`,
} as const;

export async function getAdminSellerKyc(
  sellerId: number
): Promise<ApiResult<AdminSellerKyc>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<
    Envelope<AdminSellerKyc> | AdminSellerKyc
  >(ENDPOINTS.bySellerId(sellerId), {
    method: "GET",
  });

  if (!res.ok) return res;

  const kyc = normalizeKyc(
    unwrap<AdminSellerKyc | null>(res.data, null)
  );

  if (!kyc) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned invalid KYC data.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: kyc,
  };
}

export async function approveAdminSellerKyc(
  sellerId: number
): Promise<ApiResult<true>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<void | Envelope<unknown>>(
    ENDPOINTS.approve(sellerId),
    {
      method: "PUT",
    }
  );

  if (!res.ok) return res;

  return {
    ok: true,
    status: res.status,
    data: true,
  };
}

export async function rejectAdminSellerKyc(
  sellerId: number,
  rejectionReason: string
): Promise<ApiResult<true>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const cleanReason = rejectionReason.trim();

  if (!cleanReason) {
    return {
      ok: false,
      status: 400,
      message: "Rejection reason is required.",
    };
  }

  if (cleanReason.length > 1000) {
    return {
      ok: false,
      status: 400,
      message: "Rejection reason must not exceed 1000 characters.",
    };
  }

  const res = await apiRequest<void | Envelope<unknown>>(
    ENDPOINTS.reject(sellerId),
    {
      method: "PUT",
      body: {
        rejectionReason: cleanReason,
      },
    }
  );

  if (!res.ok) return res;

  return {
    ok: true,
    status: res.status,
    data: true,
  };
}