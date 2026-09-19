/**
 * NEXTCART — Seller KYC service boundary.
 *
 * Wraps the authenticated seller KYC endpoints. The backend resolves the
 * seller from the JWT, so no sellerId is ever sent.
 *
 * Backend endpoints:
 *   GET  /api/v1/sellers/kyc
 *   GET  /api/v1/sellers/kyc/status
 *   POST /api/v1/sellers/kyc
 *   PUT  /api/v1/sellers/kyc
 *   POST /api/v1/sellers/kyc/documents   (multipart PDF upload)
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export type BusinessType =
  | "PROPRIETORSHIP"
  | "PARTNERSHIP"
  | "LLP"
  | "PRIVATE_LIMITED"
  | "PUBLIC_LIMITED"
  | "ONE_PERSON_COMPANY"
  | "TRUST"
  | "SOCIETY"
  | "OTHER";

export type KycStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

export interface SellerKycResponse {
  id: number;
  sellerId: number;
  businessType: BusinessType;
  dateOfBirth: string;
  gstNumber?: string | null;
  gstDocumentUrl?: string | null;
  registrationNumber?: string | null;
  registrationDocumentUrl?: string | null;
  ownerName: string;
  panNumber: string;
  panDocumentUrl?: string | null;
  aadhaarNumber?: string | null;
  aadhaarDocumentUrl?: string | null;
  businessAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressDocumentUrl?: string | null;
  status: KycStatus;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SellerKycRequest {
  businessType: BusinessType;
  dateOfBirth: string;
  gstNumber?: string;
  registrationNumber?: string;
  ownerName: string;
  panNumber: string;
  aadhaarNumber?: string;
  businessAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface KycDocumentFiles {
  panDocument?: File | null;
  aadhaarDocument?: File | null;
  gstDocument?: File | null;
  registrationDocument?: File | null;
  addressDocument?: File | null;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function unwrap<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const envelope = payload as Envelope<T>;
    if (envelope.data !== undefined && envelope.data !== null) {
      return envelope.data;
    }
  }
  return fallback;
}

const ENDPOINTS = {
  kyc: "/api/v1/sellers/kyc",
  status: "/api/v1/sellers/kyc/status",
  documents: "/api/v1/sellers/kyc/documents",
} as const;

/** GET /api/v1/sellers/kyc */
export async function getMyKyc(
  signal?: AbortSignal,
): Promise<ApiResult<SellerKycResponse>> {
  const res = await apiRequest<Envelope<SellerKycResponse> | SellerKycResponse>(
    ENDPOINTS.kyc,
    { method: "GET", signal },
  );
  if (!res.ok) return res;

  const kyc = unwrap<SellerKycResponse | null>(res.data, null);
  if (!kyc) {
    return { ok: false, status: res.status, message: "Empty KYC response." };
  }
  return { ok: true, status: res.status, data: kyc };
}

/** GET /api/v1/sellers/kyc/status */
export async function getMyKycStatus(
  signal?: AbortSignal,
): Promise<ApiResult<SellerKycResponse>> {
  const res = await apiRequest<Envelope<SellerKycResponse> | SellerKycResponse>(
    ENDPOINTS.status,
    { method: "GET", signal },
  );
  if (!res.ok) return res;

  const kyc = unwrap<SellerKycResponse | null>(res.data, null);
  if (!kyc) {
    return { ok: false, status: res.status, message: "Empty KYC response." };
  }
  return { ok: true, status: res.status, data: kyc };
}

/** POST /api/v1/sellers/kyc */
export async function submitKyc(
  payload: SellerKycRequest,
  signal?: AbortSignal,
): Promise<ApiResult<SellerKycResponse>> {
  const res = await apiRequest<Envelope<SellerKycResponse> | SellerKycResponse>(
    ENDPOINTS.kyc,
    { method: "POST", body: payload, signal },
  );
  if (!res.ok) return res;

  const kyc = unwrap<SellerKycResponse | null>(res.data, null);
  if (!kyc) {
    return { ok: false, status: res.status, message: "Empty KYC response." };
  }
  return { ok: true, status: res.status, data: kyc };
}

/** PUT /api/v1/sellers/kyc */
export async function updateKyc(
  payload: SellerKycRequest,
  signal?: AbortSignal,
): Promise<ApiResult<SellerKycResponse>> {
  const res = await apiRequest<Envelope<SellerKycResponse> | SellerKycResponse>(
    ENDPOINTS.kyc,
    { method: "PUT", body: payload, signal },
  );
  if (!res.ok) return res;

  const kyc = unwrap<SellerKycResponse | null>(res.data, null);
  if (!kyc) {
    return { ok: false, status: res.status, message: "Empty KYC response." };
  }
  return { ok: true, status: res.status, data: kyc };
}

/**
 * POST /api/v1/sellers/kyc/documents
 *
 * Multipart upload. Backend requires each document to be a PDF up to 2 MB.
 * Only parts with a file are sent.
 */
export async function uploadKycDocuments(
  files: KycDocumentFiles,
  signal?: AbortSignal,
): Promise<ApiResult<SellerKycResponse>> {
  const form = new FormData();

  const entries: Array<[keyof KycDocumentFiles, File | null | undefined]> = [
    ["panDocument", files.panDocument],
    ["aadhaarDocument", files.aadhaarDocument],
    ["gstDocument", files.gstDocument],
    ["registrationDocument", files.registrationDocument],
    ["addressDocument", files.addressDocument],
  ];

  for (const [key, file] of entries) {
    if (file) form.append(key, file);
  }

  const res = await apiRequest<Envelope<SellerKycResponse> | SellerKycResponse>(
    ENDPOINTS.documents,
    { method: "POST", body: form, signal },
  );
  if (!res.ok) return res;

  const kyc = unwrap<SellerKycResponse | null>(res.data, null);
  if (!kyc) {
    return { ok: false, status: res.status, message: "Empty KYC response." };
  }
  return { ok: true, status: res.status, data: kyc };
}

export type { ApiResult };