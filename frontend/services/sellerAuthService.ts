/**
 * NEXTCART — Seller auth service boundary.
 *
 * Seller registration and verification run through dedicated Spring Boot
 * endpoints. Registration itself never authenticates a seller and never
 * returns access or refresh tokens.
 *
 * Backend endpoints:
 *   POST /api/v1/auth/register/seller
 *   POST /api/v1/auth/verify-seller-email-otp
 *   POST /api/v1/auth/verify-seller-phone-otp
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ──────────────────────────────────────────────────────────────────────
   Domain types
   ────────────────────────────────────────────────────────────────────── */

export interface SellerSignupDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  gstNumber?: string;
}

export interface SellerRegistrationResult {
  message: string;
  emailOtpSent: boolean;
  phoneOtpSent: boolean;
}

/* ──────────────────────────────────────────────────────────────────────
   Wire formats — must match Spring Boot DTOs exactly
   ────────────────────────────────────────────────────────────────────── */

interface BackendSellerRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  gstNumber?: string;
}

interface BackendSellerRegisterResponse {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  emailOtpSent?: boolean;
  phoneOtpSent?: boolean;
  message?: string;
}

interface BackendVerifySellerEmailOtpRequest {
  email: string;
  otp: string;
}

interface BackendVerifySellerPhoneOtpRequest {
  phone: string;
  accessToken: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────────── */

function unwrap<T>(payload: unknown, fallback: T): T {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    const inner = (payload as { data?: unknown }).data;
    return (inner ?? fallback) as T;
  }
  return (payload as T) ?? fallback;
}

/* ──────────────────────────────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────────────────────────────── */

export const sellerAuthService = {
  /**
   * POST /api/v1/auth/register/seller
   *
   * Starts seller registration and sends the initial email OTP. This does not
   * authenticate the seller and does not return tokens.
   */
  async registerSeller(
    details: SellerSignupDetails,
    signal?: AbortSignal,
  ): Promise<ApiResult<SellerRegistrationResult>> {
    const body: BackendSellerRegisterRequest = {
      firstName: details.firstName,
      lastName: details.lastName,
      email: details.email,
      phone: details.phone,
      password: details.password,
      businessName: details.businessName,
      gstNumber:
        details.gstNumber && details.gstNumber.trim()
          ? details.gstNumber.trim()
          : undefined,
    };

    const res = await apiRequest<BackendSellerRegisterResponse>(
      "/api/v1/auth/register/seller",
      {
        method: "POST",
        body,
        skipAuthRefresh: true,
        signal,
      },
    );

    if (!res.ok) return res;

    const payload = unwrap<BackendSellerRegisterResponse | null>(
      res.data,
      null,
    );

    if (!payload || typeof payload !== "object") {
      return {
        ok: false,
        status: res.status,
        message: "Seller registration response was missing expected data.",
      };
    }

    return {
      ok: true,
      status: res.status,
      data: {
        message:
          payload.message ?? "Seller registration initiated successfully.",
        emailOtpSent: payload.emailOtpSent === true,
        phoneOtpSent: payload.phoneOtpSent === true,
      },
    };
  },

  /**
   * POST /api/v1/auth/verify-seller-email-otp
   */
  async verifySellerEmailOtp(
    email: string,
    otp: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const body: BackendVerifySellerEmailOtpRequest = { email, otp };

    const res = await apiRequest<void>(
      "/api/v1/auth/verify-seller-email-otp",
      {
        method: "POST",
        body,
        skipAuthRefresh: true,
        signal,
      },
    );

    if (!res.ok) return res;

    return { ok: true, status: res.status, data: undefined };
  },

  /**
   * POST /api/v1/auth/verify-seller-phone-otp
   *
   * The second parameter is the MSG91 widget access token, not the OTP.
   */
  async verifySellerPhoneOtp(
    phone: string,
    accessToken: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const body: BackendVerifySellerPhoneOtpRequest = { phone, accessToken };

    const res = await apiRequest<void>(
      "/api/v1/auth/verify-seller-phone-otp",
      {
        method: "POST",
        body,
        skipAuthRefresh: true,
        signal,
      },
    );

    if (!res.ok) return res;

    return { ok: true, status: res.status, data: undefined };
  },
};

export type { ApiResult };
