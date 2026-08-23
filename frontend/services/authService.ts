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
  fullName: string;
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
  message?: string;
}

interface BackendLoginResponse {
  token?: string;
  message?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────────── */

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

/**
 * The backend returns HTTP 500 (not 401) for invalid credentials, with no
 * usable `message`. Treat 401 and any 5xx from /login as an auth failure and
 * show actionable copy. A status of 0 means the request never reached the
 * server (network/CORS) — keep that message so the user knows it's not a
 * password problem.
 */
function isLikelyBadCredentials(status: number): boolean {
  return status === 401 || status >= 500;
}

/* ──────────────────────────────────────────────────────────────────────
   Public API — used by components and the Zustand auth store
   ────────────────────────────────────────────────────────────────────── */

export const authService = {
  /**
   * POST /api/v1/auth/login
   * Returns the JWT `token` plus the backend's confirmation message.
   * Persistence of the token is handled by the auth store (localStorage via
   * Zustand `persist`); the backend is bearer-only and issues no cookie.
   */
  async login(
    credentials: LoginCredentials,
    signal?: AbortSignal,
  ): Promise<ApiResult<{ token: string; message: string }>> {
    const res = await apiRequest<BackendLoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: {
        email: credentials.email,
        password: credentials.password,
      },
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
    const message = res.data?.message ?? "Login successful";
    return { ok: true, status: res.status, data: { token, message } };
  },

  /**
   * POST /api/v1/auth/register
   * The backend requires firstName + lastName + phone — we accept a single
   * "Full Name" field from the user and split it sensibly.
   */
  async register(
    details: SignupDetails,
    signal?: AbortSignal,
  ): Promise<ApiResult<{ user: AuthUser; message: string }>> {
    const { firstName, lastName } = splitFullName(details.fullName);
    const body: BackendRegisterRequest = {
      firstName,
      lastName,
      email: details.email,
      phone: details.phone,
      password: details.password,
    };

    const res = await apiRequest<BackendRegisterResponse>("/api/v1/auth/register", {
      method: "POST",
      body,
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
      firstName: res.data?.firstName ?? firstName,
      lastName: res.data?.lastName ?? lastName,
      email: res.data?.email ?? details.email,
    };
    const message = res.data?.message ?? "Registration successful";

    return { ok: true, status: res.status, data: { user, message } };
  },

  /**
   * POST /api/v1/auth/logout
   *
   * The backend JWT is stateless — logout on the server only clears the
   * SecurityContext and does NOT invalidate the token (it stays valid until
   * its 24h expiry). The authoritative logout is therefore the client
   * dropping the token from its store. We still call the endpoint
   * best-effort to honor the documented contract, and we deliberately
   * swallow any error: a failed logout call must never block the user from
   * ending their session locally.
   */
  async logout(signal?: AbortSignal): Promise<void> {
    try {
      await apiRequest("/api/v1/auth/logout", { method: "POST", signal });
    } catch {
      // Intentionally ignored — client-side token removal is authoritative.
    }
  },
};

export type { ApiResult };
