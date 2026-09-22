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

function normalizeKyc(value: any): AdminSellerKyc | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const id = toNumber(value.id);
  const sellerId = toNumber(value.sellerId);

  if (!id || id <= 0 || !sellerId || sellerId <= 0) {
    return null;
  }

  return {
    id,
    sellerId,

    businessType: toText(value.businessType),

    gstNumber: toText(value.gstNumber),
    gstDocumentUrl: toText(value.gstDocumentUrl),

    registrationNumber: toText(value.registrationNumber),
    registrationDocumentUrl: toText(value.registrationDocumentUrl),

    ownerName: toText(value.ownerName),
    dateOfBirth: toText(value.dateOfBirth),

    panNumber: toText(value.panNumber),
    panDocumentUrl: toText(value.panDocumentUrl),

    aadhaarNumber: toText(value.aadhaarNumber),
    aadhaarDocumentUrl: toText(value.aadhaarDocumentUrl),

    businessAddress: toText(value.businessAddress),
    city: toText(value.city),
    state: toText(value.state),
    postalCode: toText(value.postalCode),
    country: toText(value.country),

    addressDocumentUrl: toText(value.addressDocumentUrl),

    status: toText(value.status),
    rejectionReason: toText(value.rejectionReason),

    submittedAt: toText(value.submittedAt),
    reviewedAt: toText(value.reviewedAt),
    reviewedBy: toNumber(value.reviewedBy),

    createdAt: toText(value.createdAt),
    updatedAt: toText(value.updatedAt),
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
      body: JSON.stringify({
        rejectionReason: cleanReason,
      }),
    }
  );

  if (!res.ok) return res;

  return {
    ok: true,
    status: res.status,
    data: true,
  };
}