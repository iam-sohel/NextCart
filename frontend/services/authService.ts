/**
 * NEXTCART — Auth service boundary
 *
 * This module is the ONLY place that names Spring Boot's auth DTOs and field
 * spellings (`firstName`, `lastName`, `phone`, etc.). Components and the
 * Zustand store talk to `login` / `register` / `logout` and receive
 * a domain-shaped `AuthUser` regardless of how the wire format looks.
 *
 * Why this matters:
 *   - If the backend renames a field, we change one file, not every form.
 *   - The mobile client can call the SAME `login(credentials)` function
 *     from React Native / Kotlin / Swift bindings — both apps share the
 *     same backend contract.
 *   - Forms stay free of `firstName` vs `fullName` translation logic.
 *
 * Error contract note (confirmed against the backend):
 *   The auth endpoints do NOT return structured, user-safe error messages.
 *   Bad credentials and duplicate-email both surface as an HTTP 500 with
 *   Spring's default body ({timestamp,status,error,path}) — no `message`
 *   field — and @Valid failures come back as a bare 400. So the raw message
 *   from `lib/api.ts` for those cases is unhelpful ("Internal Server Error").
 *   This layer therefore maps those specific failures to honest, actionable
 *   copy. It does NOT invent success, and it preserves genuine network
 *   errors (status 0) so connectivity problems are still reported truthfully.
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ──────────────────────────────────────────────────────────────────────
   Domain types (what the rest of the app sees)
   ────────────────────────────────────────────────────────────────────── */

export interface AuthUser {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Input types (what the calling code passes — already "domain" shaped)
   ────────────────────────────────────────────────────────────────────── */

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface SignupDetails {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Wire formats — must match Spring Boot DTOs exactly
   ────────────────────────────────────────────────────────────────────── */

interface BackendRegisterRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
}

interface BackendRegisterResponse {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  emailOtpSent?: boolean;
  phoneOtpSent?: boolean;
  message?: string;
}



interface BackendLoginResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  message?: string;
}

interface BackendTokenRefreshResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   OTP / Complete registration wire DTOs
   ────────────────────────────────────────────────────────────────────── */

interface BackendSendEmailOtpRequest {
  email: string;
}

interface BackendVerifyEmailOtpRequest {
  email: string;
  otp: string;
}

interface BackendVerifyPhoneWidgetRequest {
  phone: string;
  accessToken: string;
}

interface BackendCompleteRegistrationRequest {
  email?: string;
  phone?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────────── */

function isLikelyBadCredentials(status: number): boolean {
  return status === 401 || status >= 500;
}

/* ──────────────────────────────────────────────────────────────────────
   Public API — used by components and the Zustand auth store
   ────────────────────────────────────────────────────────────────────── */

export const authService = {
  /**
   * POST /api/v1/auth/login
   *
   * Login using either email OR phone.
   *
   * Backend returns:
   *   accessToken
   *   refreshToken
   *   tokenType
   *   userId
   *   firstName
   *   lastName
   *   email
   *   phone
   *   role
   *   message
   */
  async login(
      credentials: LoginCredentials,
      signal?: AbortSignal,
  ): Promise<
      ApiResult<{
        token: string;
        refreshToken: string;
        message: string;
        user?: AuthUser;
      }>
  > {
    const res = await apiRequest<BackendLoginResponse>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: {
            email: credentials.email,
            phone: credentials.phone,
            password: credentials.password,
          },
          skipAuthRefresh: true,
          signal,
        },
    );

    if (!res.ok) {
      if (isLikelyBadCredentials(res.status)) {
        return {
          ...res,
          message:
              "Invalid email/phone or password. Please try again.",
        };
      }

      return res;
    }

    const token = res.data?.accessToken ?? "";
    const refreshToken = res.data?.refreshToken ?? "";
    const message =
        res.data?.message ?? "Login successful";

    const user: AuthUser = {
      id: res.data?.userId,
      firstName: res.data?.firstName ?? "",
      lastName: res.data?.lastName ?? "",
      email: res.data?.email ?? "",
      phone: res.data?.phone ?? "",
    };

    return {
      ok: true,
      status: res.status,
      data: {
        token,
        refreshToken,
        message,
        user,
      },
    };
  },

  /**
   * POST /api/v1/auth/register
   *
   * Registration supports either email OR phone.
   */
  async register(
      details: SignupDetails,
      signal?: AbortSignal,
  ): Promise<ApiResult<{ user: AuthUser; message: string }>> {
    const body: BackendRegisterRequest = {
      firstName: details.firstName,
      lastName: details.lastName,
      email: details.email,
      phone: details.phone,
      password: details.password,
    };

    const res = await apiRequest<BackendRegisterResponse>(
        "/api/v1/auth/register",
        {
          method: "POST",
          body,
          skipAuthRefresh: true,
          signal,
        },
    );

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message:
              "We couldn't create your account. This email or mobile number may already be registered.",
        };
      }

      return res;
    }

    const user: AuthUser = {
      id: res.data?.id,
      firstName:
          res.data?.firstName ?? details.firstName,
      lastName:
          res.data?.lastName ?? details.lastName,
      email:
          res.data?.email ?? details.email,
      phone:
          res.data?.phone ?? details.phone,
    };

    const message =
        res.data?.message ?? "Registration successful";

    return {
      ok: true,
      status: res.status,
      data: {
        user,
        message,
      },
    };
  },

  /**
   * POST /api/v1/auth/refresh
   *
   * Exchanges a valid refresh token for a NEW access token
   * and a NEW refresh token.
   */
  async refreshSession(
      refreshToken: string,
      signal?: AbortSignal,
  ): Promise<
      ApiResult<{
        accessToken: string;
        refreshToken: string;
      }>
  > {
    const res =
        await apiRequest<BackendTokenRefreshResponse>(
            "/api/v1/auth/refresh",
            {
              method: "POST",
              body: { refreshToken },
              token: null,
              skipAuthRefresh: true,
              signal,
            },
        );

    if (!res.ok) return res;

    const accessToken =
        res.data?.accessToken ?? "";

    const rotatedRefreshToken =
        res.data?.refreshToken ?? "";

    if (!accessToken || !rotatedRefreshToken) {
      return {
        ok: false,
        status: res.status,
        message:
            "Refresh response did not contain the expected tokens.",
      };
    }

    return {
      ok: true,
      status: res.status,
      data: {
        accessToken,
        refreshToken: rotatedRefreshToken,
      },
    };
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(
      signal?: AbortSignal,
  ): Promise<void> {
    try {
      await apiRequest(
          "/api/v1/auth/logout",
          {
            method: "POST",
            skipAuthRefresh: true,
            signal,
          },
      );
    } catch {
      // Client-side token removal is authoritative.
    }
  },

  /* ──────────────────────────────────────────────────────────────────────
     OTP verification & complete registration
     ────────────────────────────────────────────────────────────────────── */

  /**
   * POST /api/v1/auth/email/send-otp
   *
   * Sends email OTP.
   */
  async sendEmailVerificationOtp(
      email: string,
      signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const res =
        await apiRequest<BackendSendEmailOtpRequest>(
            "/api/v1/auth/email/send-otp",
            {
              method: "POST",
              body: { email },
              skipAuthRefresh: true,
              signal,
            },
        );

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message:
              "We couldn't send the email verification code. Please try again.",
        };
      }

      return res;
    }

    return {
      ok: true,
      status: res.status,
      data: undefined,
    };
  },

  /**
   * POST /api/v1/auth/email/verify-otp
   *
   * Verifies email OTP.
   */
  async verifyEmailOtp(
      email: string,
      otp: string,
      signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const res =
        await apiRequest<BackendVerifyEmailOtpRequest>(
            "/api/v1/auth/email/verify-otp",
            {
              method: "POST",
              body: { email, otp },
              skipAuthRefresh: true,
              signal,
            },
        );

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message:
              "We couldn't verify the email code. Please try again.",
        };
      }

      return res;
    }

    return {
      ok: true,
      status: res.status,
      data: undefined,
    };
  },

  /**
   * PHONE OTP
   *
   * MSG91 Widget handles:
   *   - Sending OTP
   *   - OTP verification
   *
   * Frontend receives the MSG91 access token after successful
   * widget verification.
   *
   * Backend then verifies that access token through:
   *
   * POST /api/v1/auth/phone/verify-widget
   *
   * IMPORTANT:
   * This method name is kept as `verifyPhoneOtp` so existing
   * Zustand/frontend code can continue using the same method.
   *
   * The second parameter is now MSG91 `accessToken`,
   * NOT the OTP itself.
   */
  async verifyPhoneOtp(
      phone: string,
      accessToken: string,
      signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const body: BackendVerifyPhoneWidgetRequest = {
      phone,
      accessToken,
    };

    const res =
        await apiRequest<void>(
            "/api/v1/auth/phone/verify-widget",
            {
              method: "POST",
              body,
              skipAuthRefresh: true,
              signal,
            },
        );

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message:
              "We couldn't verify your phone number. Please try again.",
        };
      }

      return res;
    }

    return {
      ok: true,
      status: res.status,
      data: undefined,
    };
  },

  /**
   * POST /api/v1/auth/register/complete
   *
   * Finalizes customer registration after the selected
   * identifier has been verified.
   *
   * Supported:
   *
   * Email registration:
   *   email = verified email
   *   phone = undefined
   *
   * Phone registration:
   *   email = undefined
   *   phone = verified phone
   *
   * Do NOT send password or OTP in this request.
   */
  async completeRegistration(
      email?: string,
      phone?: string,
      signal?: AbortSignal,
  ): Promise<
      ApiResult<{
        user: AuthUser;
        message: string;
      }>
  > {
    const body: BackendCompleteRegistrationRequest = {
      email,
      phone,
    };

    const res =
        await apiRequest<BackendRegisterResponse>(
            "/api/v1/auth/register/complete",
            {
              method: "POST",
              body,
              skipAuthRefresh: true,
              signal,
            },
        );

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message:
              "We couldn't complete your registration. Please try again or create a new account.",
        };
      }

      return res;
    }

    const user: AuthUser = {
      id: res.data?.id,
      firstName: res.data?.firstName ?? "",
      lastName: res.data?.lastName ?? "",
      email: res.data?.email ?? email,
      phone: res.data?.phone ?? phone,
    };

    const message =
        res.data?.message ?? "Registration complete";

    return {
      ok: true,
      status: res.status,
      data: {
        user,
        message,
      },
    };
  },
};

/* ──────────────────────────────────────────────────────────────────────
   Wire DTOs for OTP / complete endpoints
   (kept for reference, re-exported if needed)
   ────────────────────────────────────────────────────────────────────── */

export type { ApiResult };