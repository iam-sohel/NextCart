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
  email: string;
  phone?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Input types (what the calling code passes — already "domain" shaped)
   ────────────────────────────────────────────────────────────────────── */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Wire formats — must match Spring Boot DTOs exactly
   ────────────────────────────────────────────────────────────────────── */

interface BackendRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface BackendRegisterResponse {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

interface BackendLoginUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface BackendLoginResponse {
  token?: string;
  refreshToken?: string;
  message?: string;
  user?: BackendLoginUser;
}

/**
 * Response from `POST /api/v1/auth/refresh` (Spring `TokenRefreshResponse`).
 * NOTE the field-name mismatch with login, confirmed against the backend:
 * login returns the access token as `token`, whereas refresh returns it as
 * `accessToken`. Both also return a rotated `refreshToken`.
 */
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

interface BackendSendPhoneOtpRequest {
  phone: string;
}

interface BackendVerifyPhoneOtpRequest {
  phone: string;
  otp: string;
}

interface BackendCompleteRegistrationRequest {
  email: string;
  phone: string;
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
   * Returns the JWT `token`, a `refreshToken`, plus the backend's confirmation
   * message. Persistence of both tokens is handled by the auth store
   * (localStorage via Zustand `persist`); the backend is bearer-only and
   * issues no cookie. `skipAuthRefresh` keeps this call out of the automatic
   * refresh-on-401 machinery — a failed login is a credentials problem, not an
   * expired session.
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
  >{
    const res = await apiRequest<BackendLoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: {
        email: credentials.email,
        password: credentials.password,
      },
      skipAuthRefresh: true,
      signal,
    });

    if (!res.ok) {
      if (isLikelyBadCredentials(res.status)) {
        return {
          ...res,
          message: "Invalid email or password. Please try again.",
        };
      }
      return res;
    }

    const token = res.data?.token ?? "";
    const refreshToken = res.data?.refreshToken ?? "";
    const message = res.data?.message ?? "Login successful";

    const user: AuthUser | undefined = res.data?.user
      ? {
          id: res.data.user.id,
          firstName: res.data.user.firstName ?? "",
          lastName: res.data.user.lastName ?? "",
          email: res.data.user.email ?? "",
          phone: res.data.user.phone ?? "",
        }
      : undefined;

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
   * The backend requires firstName + lastName + phone — we now accept them
   * directly from the form, no splitting needed.
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

    const res = await apiRequest<BackendRegisterResponse>("/api/v1/auth/register", {
      method: "POST",
      body,
      skipAuthRefresh: true,
      signal,
    });

    if (!res.ok) {
      // The backend throws a raw RuntimeException (→ HTTP 500) when the email
      // or phone is already registered, with no usable message. Surface an
      // honest, hedged explanation. Network errors (status 0) are preserved.
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
      firstName: res.data?.firstName ?? details.firstName,
      lastName: res.data?.lastName ?? details.lastName,
      email: res.data?.email ?? details.email,
    };
    const message = res.data?.message ?? "Registration successful";

    return { ok: true, status: res.status, data: { user, message } };
  },

  /**
   * POST /api/v1/auth/refresh
   *
   * Exchanges a still-valid refresh token for a NEW access token AND a NEW
   * refresh token (the backend rotates the refresh token on every call and
   * deletes the previous one, so only one refresh token per user is ever
   * live). The request carries the refresh token in the BODY — never as a
   * Bearer header — so we pass `token: null` to suppress attaching the
   * (possibly expired) access token, and `skipAuthRefresh: true` so a failed
   * refresh can never recursively try to refresh itself.
   *
   * Returns the mapped `{ accessToken, refreshToken }`. A non-ok result is
   * passed through so the caller can distinguish an invalid/expired refresh
   * token (status ≥ 400 → session over) from a network failure (status 0 →
   * transient, keep the session).
   */
  async refreshSession(
    refreshToken: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<{ accessToken: string; refreshToken: string }>> {
    const res = await apiRequest<BackendTokenRefreshResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      token: null,
      skipAuthRefresh: true,
      signal,
    });

    if (!res.ok) return res;

    const accessToken = res.data?.accessToken ?? "";
    const rotatedRefreshToken = res.data?.refreshToken ?? "";

    // A 2xx that is missing either token is not a usable session — treat it as
    // a failed refresh rather than storing empty credentials.
    if (!accessToken || !rotatedRefreshToken) {
      return {
        ok: false,
        status: res.status,
        message: "Refresh response did not contain the expected tokens.",
      };
    }

    return {
      ok: true,
      status: res.status,
      data: { accessToken, refreshToken: rotatedRefreshToken },
    };
  },

  /**
   * POST /api/v1/auth/logout
   *
   * The backend now deletes the user's refresh token(s) server-side, so this
   * call genuinely ends the refreshable session — but the 24h access JWT is
   * still stateless and cannot be revoked, so the authoritative client-side
   * logout remains dropping the tokens from the store. We call the endpoint
   * best-effort to honor the contract, mark it `skipAuthRefresh` so a 401/500
   * during logout never triggers a refresh, and deliberately swallow any
   * error: a failed logout call must never block the user from ending their
   * session locally.
   */
  async logout(signal?: AbortSignal): Promise<void> {
    try {
      await apiRequest("/api/v1/auth/logout", {
        method: "POST",
        skipAuthRefresh: true,
        signal,
      });
    } catch {
      // Intentionally ignored — client-side token removal is authoritative.
    }
  },

  /* ──────────────────────────────────────────────────────────────────────
   OTP verification & complete registration
   ────────────────────────────────────────────────────────────────────── */

  /**
   * POST /api/v1/auth/email/send-otp
   * Sends a 6-digit verification code to the given email address.
   * The backend stores the OTP hash and associates it with a pending
   * registration (or creates one if none exists for this email).
   *
   * OTP expiry: 5 minutes. Max attempts: 5.
   */
  async sendEmailVerificationOtp(
    email: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const res = await apiRequest<BackendSendEmailOtpRequest>("/api/v1/auth/email/send-otp", {
      method: "POST",
      body: { email },
      skipAuthRefresh: true,
      signal,
    });

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message: "We couldn't send the email verification code. Please try again.",
        };
      }
      return res;
    }

    return { ok: true, status: res.status, data: undefined };
  },

  /**
   * POST /api/v1/auth/email/verify-otp
   * Verifies a 6-digit OTP for the given email.
   * On success, marks the email as verified on the pending registration.
   *
   * OTP expiry: 5 minutes. Max attempts: 5.
   */
  async verifyEmailOtp(
    email: string,
    otp: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const res = await apiRequest<BackendVerifyEmailOtpRequest>("/api/v1/auth/email/verify-otp", {
      method: "POST",
      body: { email, otp },
      skipAuthRefresh: true,
      signal,
    });

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message: "We couldn't verify the email code. Please try again.",
        };
      }
      return res;
    }

    return { ok: true, status: res.status, data: undefined };
  },

  /**
   * POST /api/v1/auth/phone/send-otp
   * Sends a 6-digit verification code to the given phone number via SMS.
   * Note: The SMS service is currently a stub that only logs the request.
   * In production, integrate with Twilio/MSG91/AWS SNS.
   *
   * OTP expiry: 5 minutes. Max attempts: 5.
   */
  async sendPhoneVerificationOtp(
    phone: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const res = await apiRequest<BackendSendPhoneOtpRequest>("/api/v1/auth/phone/send-otp", {
      method: "POST",
      body: { phone },
      skipAuthRefresh: true,
      signal,
    });

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message: "We couldn't send the phone verification code. Please try again.",
        };
      }
      return res;
    }

    return { ok: true, status: res.status, data: undefined };
  },

  /**
   * POST /api/v1/auth/phone/verify-otp
   * Verifies a 6-digit OTP for the given phone number.
   * On success, marks the phone as verified on the pending registration.
   *
   * OTP expiry: 5 minutes. Max attempts: 5.
   */
  async verifyPhoneOtp(
    phone: string,
    otp: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<void>> {
    const res = await apiRequest<BackendVerifyPhoneOtpRequest>("/api/v1/auth/phone/verify-otp", {
      method: "POST",
      body: { phone, otp },
      skipAuthRefresh: true,
      signal,
    });

    if (!res.ok) {
      if (res.status >= 500) {
        return {
          ...res,
          message: "We couldn't verify the phone code. Please try again.",
        };
      }
      return res;
    }

    return { ok: true, status: res.status, data: undefined };
  },

  /**
   * POST /api/v1/auth/register/complete
   * Finalizes customer registration after both email and phone OTPs are verified.
   * Looks up the pending registration by email+phone, checks that both
   * verifications succeeded, then creates the real user account.
   *
   * Do NOT send password or OTPs in this request — the backend already has
   * the password hash from the initial /register call.
   */
  async completeRegistration(
    email: string,
    phone: string,
    signal?: AbortSignal,
  ): Promise<ApiResult<{ user: AuthUser; message: string }>> {
    const body: BackendCompleteRegistrationRequest = {
      email,
      phone,
    };

    const res = await apiRequest<BackendRegisterResponse>("/api/v1/auth/register/complete", {
      method: "POST",
      body,
      skipAuthRefresh: true,
      signal,
    });

    if (!res.ok) {
      // Handle specific backend errors
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

    const message = res.data?.message ?? "Registration complete";

    return { ok: true, status: res.status, data: { user, message } };
  },
};

/* ──────────────────────────────────────────────────────────────────────
   Wire DTOs for OTP / complete endpoints
   (kept for reference, re-exported if needed)
   ────────────────────────────────────────────────────────────────────── */

export type { ApiResult };