import { apiRequest, type ApiResult } from "@/lib/api";

export interface AdminSellerVerification {
  id: number;
  overallStatus: string;
  emailStatus: string;
  emailResult: string | null;
  mobileStatus: string;
  mobileResult: string | null;
  panStatus: string;
  panResult: string | null;
  gstinStatus: string;
  gstinResult: string | null;
  startedAt: string | null;
  completedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: number | null;
  rejectionReason: string | null;
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

function normalizeVerification(
  value: any
): AdminSellerVerification | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const id = toNumber(value.id);

  if (!id || id <= 0) {
    return null;
  }

  return {
    id,
    overallStatus: String(value.overallStatus ?? ""),
    emailStatus: String(value.emailStatus ?? ""),
    emailResult: toText(value.emailResult),
    mobileStatus: String(value.mobileStatus ?? ""),
    mobileResult: toText(value.mobileResult),
    panStatus: String(value.panStatus ?? ""),
    panResult: toText(value.panResult),
    gstinStatus: String(value.gstinStatus ?? ""),
    gstinResult: toText(value.gstinResult),
    startedAt: toText(value.startedAt),
    completedAt: toText(value.completedAt),
    reviewedAt: toText(value.reviewedAt),
    reviewedBy: toNumber(value.reviewedBy),
    rejectionReason: toText(value.rejectionReason),
    createdAt: toText(value.createdAt),
    updatedAt: toText(value.updatedAt),
  };
}

function validSellerId(sellerId: number): boolean {
  return Number.isInteger(sellerId) && sellerId > 0;
}

const ENDPOINTS = {
  bySellerId: (sellerId: number) =>
    `/api/v1/admin/sellers/verification/${encodeURIComponent(
      String(sellerId)
    )}`,

  approve: (sellerId: number) =>
    `/api/v1/admin/sellers/verification/${encodeURIComponent(
      String(sellerId)
    )}/approve`,

  reject: (sellerId: number) =>
    `/api/v1/admin/sellers/verification/${encodeURIComponent(
      String(sellerId)
    )}/reject`,
} as const;

export async function getAdminSellerVerification(
  sellerId: number
): Promise<ApiResult<AdminSellerVerification>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<
    Envelope<AdminSellerVerification> | AdminSellerVerification
  >(ENDPOINTS.bySellerId(sellerId), {
    method: "GET",
  });

  if (!res.ok) return res;

  const verification = normalizeVerification(
    unwrap<AdminSellerVerification | null>(res.data, null)
  );

  if (!verification) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned invalid verification data.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: verification,
  };
}

export async function approveAdminSellerVerification(
  sellerId: number
): Promise<ApiResult<AdminSellerVerification>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const res = await apiRequest<
    Envelope<AdminSellerVerification> | AdminSellerVerification
  >(ENDPOINTS.approve(sellerId), {
    method: "PUT",
  });

  if (!res.ok) return res;

  const verification = normalizeVerification(
    unwrap<AdminSellerVerification | null>(res.data, null)
  );

  if (!verification) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned invalid verification data.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: verification,
  };
}

export async function rejectAdminSellerVerification(
  sellerId: number,
  reason: string
): Promise<ApiResult<AdminSellerVerification>> {
  if (!validSellerId(sellerId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid seller ID.",
    };
  }

  const cleanReason = reason.trim();

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

  const res = await apiRequest<
    Envelope<AdminSellerVerification> | AdminSellerVerification
  >(ENDPOINTS.reject(sellerId), {
    method: "PUT",
    body: JSON.stringify({
      reason: cleanReason,
    }),
  });

  if (!res.ok) return res;

  const verification = normalizeVerification(
    unwrap<AdminSellerVerification | null>(res.data, null)
  );

  if (!verification) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned invalid verification data.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: verification,
  };
}