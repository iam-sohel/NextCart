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
  /** Backend role (e.g. CUSTOMER / SELLER / ADMIN) when the login response provides it. */
  role?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Input types (what the calling code passes — already "domain" shaped)
   ────────────────────────────────────────────────────────────────────── */

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export type AuthLoginEndpoint =
  | "/api/v1/auth/login"
  | "/api/v1/auth/admin/login";

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

interface BackendForgotPasswordRequest {
  email?: string;
  phone?: string;
}

interface BackendVerifyResetOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
}

interface BackendVerifyResetOtpResponse {
  resetToken?: string;
}

interface BackendResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────────── */

function isLikelyBadCredentials(status: number): boolean {
  return status === 401 || status >= 500;
}

/**
 * The auth endpoints answer with the standard NextCart envelope
 * (`{ success, message, data }`), and `apiRequest` hands back the parsed
 * body as-is — so the payload must be pulled out of `data` when it is
 * wrapped. Falls back to the raw body for unwrapped responses.
 *
 * Mirrors the helper used by the other services (e.g. wishlistService).
 * Without this, `res.data.accessToken` reads a field that lives one level
 * deeper and silently resolves to `undefined` — which stored an empty
 * token at login and made every auth check treat a logged-in user as a
 * guest (the wishlist → /login redirect bug).
 */
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
   Public API — used by components and the Zustand auth store
   ────────────────────────────────────────────────────────────────────── */

export const authService = {
  /**
   * POST /api/v1/auth/login
   *
   * Login using either email OR phone. Defaults to the shared login
   * endpoint; admin callers may explicitly pass the admin login endpoint.
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
      endpoint: AuthLoginEndpoint = "/api/v1/auth/login",
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
        endpoint,
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

    const payload = unwrap<BackendLoginResponse | null>(res.data, null);

    const token = payload?.accessToken ?? "";
    const refreshToken = payload?.refreshToken ?? "";
    const message =
        payload?.message ?? "Login successful";

    const user: AuthUser = {
      id: payload?.userId,
      firstName: payload?.firstName ?? "",
      lastName: payload?.lastName ?? "",
      email: payload?.email ?? "",
      phone: payload?.phone ?? "",
      role: payload?.role,
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

    const payload =
        unwrap<BackendTokenRefreshResponse | null>(res.data, null);

    const accessToken =
        payload?.accessToken ?? "";

    const rotatedRefreshToken =
        payload?.refreshToken ?? "";

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

  /**
   * POST /api/v1/auth/forgot-password
   *
   * Sends a 6-digit reset OTP to the given email OR phone. The backend
   * answers success even when the account does not exist (to avoid account
   * enumeration), so callers must not promise that an OTP was definitely
   * sent — the UI copy says "if the account exists".
   */
  async forgotPassword(
      identifier: { email?: string; phone?: string },
      signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const body: BackendForgotPasswordRequest = {
      email: identifier.email || undefined,
      phone: identifier.phone || undefined,
    };

    const res = await apiRequest<void>(
        "/api/v1/auth/forgot-password",
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
   * POST /api/v1/auth/forgot-password/verify-otp
   *
   * Verifies the 6-digit reset OTP and returns a single-use reset token for
   * the final reset call.
   */
  async verifyResetOtp(
      request: { email?: string; phone?: string; otp: string },
      signal?: AbortSignal,
  ): Promise<ApiResult<{ resetToken: string }>> {
    const body: BackendVerifyResetOtpRequest = {
      email: request.email || undefined,
      phone: request.phone || undefined,
      otp: request.otp,
    };

    const res = await apiRequest<BackendVerifyResetOtpResponse>(
        "/api/v1/auth/forgot-password/verify-otp",
        {
          method: "POST",
          body,
          skipAuthRefresh: true,
          signal,
        },
    );

    if (!res.ok) {
      if (isLikelyBadCredentials(res.status)) {
        return {
          ...res,
          message:
              "The verification code is invalid or has expired. Please request a new one.",
        };
      }
      return res;
    }

    const payload = unwrap<BackendVerifyResetOtpResponse | null>(
        res.data,
        null,
    );
    const resetToken = payload?.resetToken ?? "";

    if (!resetToken) {
      return {
        ok: false,
        status: res.status,
        message:
            "The server did not return a reset token. Please request a new code.",
      };
    }

    return {
      ok: true,
      status: res.status,
      data: { resetToken },
    };
  },

  /**
   * POST /api/v1/auth/reset-password
   *
   * Sets the new password using the single-use reset token. Backend requires
   * 8–100 characters; the UI enforces the same signup password policy.
   */
  async resetPassword(
      request: {
        resetToken: string;
        newPassword: string;
        confirmPassword: string;
      },
      signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const body: BackendResetPasswordRequest = {
      resetToken: request.resetToken,
      newPassword: request.newPassword,
      confirmPassword: request.confirmPassword,
    };

    const res = await apiRequest<void>(
        "/api/v1/auth/reset-password",
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
              "We couldn't reset your password. The reset link may have expired — please start again.",
        };
      }
      return res;
    }

    return { ok: true, status: res.status, data: undefined };
  },
};

/* ──────────────────────────────────────────────────────────────────────
   Wire DTOs for OTP / complete endpoints
   (kept for reference, re-exported if needed)
   ────────────────────────────────────────────────────────────────────── */

export type { ApiResult };