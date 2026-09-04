/**
 * NEXTCART — User / Profile service boundary.
 *
 * Wraps the authenticated user endpoints exposed by the Spring Boot backend.
 *
 * Backend endpoints:
 *   GET   /api/v1/users/me
 *   PUT   /api/v1/users/me
 *   PATCH /api/v1/users/me/password
 *   PATCH /api/v1/users/me/deactivate
 */

import { apiRequest, type ApiResult } from "@/lib/api";

/* ─────────────────────────────────────────────────────────────────────
   Wire types — must match backend DTOs
   ───────────────────────────────────────────────────────────────────── */

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  enabled: boolean;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
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

/* ─────────────────────────────────────────────────────────────────────
   Endpoint helpers
   ───────────────────────────────────────────────────────────────────── */

const ENDPOINTS = {
  me: "/api/v1/users/me",
  password: "/api/v1/users/me/password",
  deactivate: "/api/v1/users/me/deactivate",
} as const;

/* ─────────────────────────────────────────────────────────────────────
   Profile
   ───────────────────────────────────────────────────────────────────── */

/**
 * GET /api/v1/users/me
 *
 * Returns the currently authenticated user's profile.
 */
export async function getMyProfile(
  signal?: AbortSignal,
): Promise<ApiResult<UserResponse>> {
  const res = await apiRequest<Envelope<UserResponse> | UserResponse>(
    ENDPOINTS.me,
    {
      method: "GET",
      signal,
    },
  );

  if (!res.ok) return res;

  const user = unwrap<UserResponse | null>(res.data, null);

  if (!user) {
    return {
      ok: false,
      status: res.status,
      message: "Empty profile response from server.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: user,
  };
}

/**
 * PUT /api/v1/users/me
 *
 * Updates the authenticated user's editable profile fields.
 */
export async function updateMyProfile(
  payload: UserUpdateRequest,
  signal?: AbortSignal,
): Promise<ApiResult<UserResponse>> {
  const res = await apiRequest<Envelope<UserResponse> | UserResponse>(
    ENDPOINTS.me,
    {
      method: "PUT",
      body: payload,
      signal,
    },
  );

  if (!res.ok) return res;

  const user = unwrap<UserResponse | null>(res.data, null);

  if (!user) {
    return {
      ok: false,
      status: res.status,
      message: "Empty profile response from server.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data: user,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Password
   ───────────────────────────────────────────────────────────────────── */

/**
 * PATCH /api/v1/users/me/password
 *
 * Changes the authenticated user's password.
 *
 * Backend validates:
 *   - currentPassword required
 *   - newPassword required, 8–100 characters
 *   - confirmPassword required
 */
export async function changeMyPassword(
  payload: ChangePasswordRequest,
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  if (payload.newPassword !== payload.confirmPassword) {
    return {
      ok: false,
      status: 400,
      message: "New password and confirmation password do not match.",
    };
  }

  const res = await apiRequest<void | Envelope<unknown>>(
    ENDPOINTS.password,
    {
      method: "PATCH",
      body: payload,
      signal,
    },
  );

  if (!res.ok) return res;

  return {
    ok: true,
    status: res.status,
    data: true,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   Account
   ───────────────────────────────────────────────────────────────────── */

/**
 * PATCH /api/v1/users/me/deactivate
 *
 * Deactivates the authenticated user's account.
 */
export async function deactivateMyAccount(
  signal?: AbortSignal,
): Promise<ApiResult<true>> {
  const res = await apiRequest<void | Envelope<unknown>>(
    ENDPOINTS.deactivate,
    {
      method: "PATCH",
      signal,
    },
  );

  if (!res.ok) return res;

  return {
    ok: true,
    status: res.status,
    data: true,
  };
}

export type { ApiResult };