/**
 * NEXTCART — Auth service boundary
 *
 * This module is the ONLY place that names Spring Boot's auth DTOs and field
 * spellings (`firstName`, `lastName`, `phone`, etc.). Components and the
 * Zustand store talk to `loginUser` / `registerUser` / `logout` and receive
 * a domain-shaped `AuthUser` regardless of how the wire format looks.
 *
 * Why this matters:
 *   - If the backend renames a field, we change one file, not every form.
 *   - The mobile client can call the SAME `loginUser(credentials)` function
 *     from React Native / Kotlin / Swift bindings — both apps share the
 *     same backend contract.
 *   - Forms stay free of `firstName` vs `fullName` translation logic.
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

/* ──────────────────────────────────────────────────────────────────────
   Public API — used by components and the Zustand auth store
   ────────────────────────────────────────────────────────────────────── */

export const authService = {
  /**
   * POST /api/v1/auth/login
   * Returns the JWT `token` plus the backend's confirmation message.
   * The web client should NOT persist `token` to localStorage in production;
   * until the backend issues an HttpOnly cookie we keep it in memory only.
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

    if (!res.ok) return res;

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

    if (!res.ok) return res;

    const user: AuthUser = {
      id: res.data?.id,
      firstName: res.data?.firstName ?? firstName,
      lastName: res.data?.lastName ?? lastName,
      email: res.data?.email ?? details.email,
    };
    const message = res.data?.message ?? "Registration successful";

    return { ok: true, status: res.status, data: { user, message } };
  },
};

export type { ApiResult };
