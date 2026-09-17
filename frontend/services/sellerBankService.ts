/**
 * NEXTCART — Seller bank account service boundary.
 *
 * Wraps the authenticated seller bank endpoints. The backend resolves the
 * seller from the JWT and returns the account number masked.
 *
 * Backend endpoints:
 *   GET    /api/v1/sellers/bank
 *   POST   /api/v1/sellers/bank
 *   PUT    /api/v1/sellers/bank
 *   DELETE /api/v1/sellers/bank   (deactivates the bank account)
 */

import { apiRequest, type ApiResult } from "@/lib/api";

export type BankVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface SellerBankResponse {
  id: number;
  sellerId: number;
  accountHolderName: string;
  maskedAccountNumber?: string | null;
  ifscCode: string;
  bankName: string;
  verificationStatus: BankVerificationStatus;
  active: boolean;
  verifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SellerBankRequest {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
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
  bank: "/api/v1/sellers/bank",
} as const;

/** GET /api/v1/sellers/bank */
export async function getMyBankAccount(
  signal?: AbortSignal,
): Promise<ApiResult<SellerBankResponse>> {
  const res = await apiRequest<
    Envelope<SellerBankResponse> | SellerBankResponse
  >(ENDPOINTS.bank, { method: "GET", signal });
  if (!res.ok) return res;

  const bank = unwrap<SellerBankResponse | null>(res.data, null);
  if (!bank) {
    return { ok: false, status: res.status, message: "Empty bank response." };
  }
  return { ok: true, status: res.status, data: bank };
}

/** POST /api/v1/sellers/bank */
export async function addBankAccount(
  payload: SellerBankRequest,
  signal?: AbortSignal,
): Promise<ApiResult<SellerBankResponse>> {
  const res = await apiRequest<
    Envelope<SellerBankResponse> | SellerBankResponse
  >(ENDPOINTS.bank, { method: "POST", body: payload, signal });
  if (!res.ok) return res;

  const bank = unwrap<SellerBankResponse | null>(res.data, null);
  if (!bank) {
    return { ok: false, status: res.status, message: "Empty bank response." };
  }
  return { ok: true, status: res.status, data: bank };
}

/** PUT /api/v1/sellers/bank */
export async function updateBankAccount(
  payload: SellerBankRequest,
  signal?: AbortSignal,
): Promise<ApiResult<SellerBankResponse>> {
  const res = await apiRequest<
    Envelope<SellerBankResponse> | SellerBankResponse
  >(ENDPOINTS.bank, { method: "PUT", body: payload, signal });
  if (!res.ok) return res;

  const bank = unwrap<SellerBankResponse | null>(res.data, null);
  if (!bank) {
    return { ok: false, status: res.status, message: "Empty bank response." };
  }
  return { ok: true, status: res.status, data: bank };
}

/** DELETE /api/v1/sellers/bank — deactivates the bank account. */
export async function deactivateBankAccount(
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  const res = await apiRequest<void | Envelope<unknown>>(ENDPOINTS.bank, {
    method: "DELETE",
    signal,
  });
  if (!res.ok) return res;
  return { ok: true, status: res.status, data: true };
}

export type { ApiResult };
