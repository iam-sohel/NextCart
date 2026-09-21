import { apiRequest } from "@/lib/api";

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

function normaliseKyc(value: any): AdminSellerKyc {
  return {
    id: Number(value?.id ?? 0),
    sellerId: Number(value?.sellerId ?? 0),

    businessType: value?.businessType ?? null,

    gstNumber: value?.gstNumber ?? null,
    gstDocumentUrl: value?.gstDocumentUrl ?? null,

    registrationNumber:
      value?.registrationNumber ?? null,
    registrationDocumentUrl:
      value?.registrationDocumentUrl ?? null,

    ownerName: value?.ownerName ?? null,
    dateOfBirth: value?.dateOfBirth ?? null,

    panNumber: value?.panNumber ?? null,
    panDocumentUrl:
      value?.panDocumentUrl ?? null,

    aadhaarNumber:
      value?.aadhaarNumber ?? null,
    aadhaarDocumentUrl:
      value?.aadhaarDocumentUrl ?? null,

    businessAddress:
      value?.businessAddress ?? null,

    city: value?.city ?? null,
    state: value?.state ?? null,
    postalCode:
      value?.postalCode ?? null,
    country:
      value?.country ?? null,

    addressDocumentUrl:
      value?.addressDocumentUrl ?? null,

    status:
      value?.status ?? "PENDING",

    rejectionReason:
      value?.rejectionReason ?? null,

    submittedAt:
      value?.submittedAt ?? null,

    reviewedAt:
      value?.reviewedAt ?? null,

    reviewedBy:
      value?.reviewedBy == null
        ? null
        : Number(value.reviewedBy),

    createdAt:
      value?.createdAt ?? null,

    updatedAt:
      value?.updatedAt ?? null,
  };
}

function normalisePage(value: any): AdminSellerKycPage {
  const content = Array.isArray(value?.content)
    ? value.content.map(normaliseKyc)
    : [];

  return {
    content,

    page: Number(value?.page ?? 0),

    size: Number(
      value?.size ?? content.length,
    ),

    totalElements: Number(
      value?.totalElements ?? content.length,
    ),

    totalPages: Number(
      value?.totalPages ??
        (content.length ? 1 : 0),
    ),

    first: value?.first,
    last: value?.last,
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

  return normalisePage(
    unwrap<any>(response),
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

  return normaliseKyc(
    unwrap<any>(response),
  );
}

export async function approveAdminKyc(
  sellerId: number | string,
): Promise<void> {
  await apiRequest(
    `/api/v1/admin/sellers/${sellerId}/kyc/approve`,
    {
      method: "PUT",
    },
  );
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

  await apiRequest(
    `/api/v1/admin/sellers/${sellerId}/kyc/reject`,
    {
      method: "PUT",
      body: {
        rejectionReason: reason,
      },
    },
  );
}