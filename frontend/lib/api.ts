/**
 * NEXTCART — Lightweight HTTP client
 *
 * Why a thin wrapper around `fetch`?
 *   - The Next.js web client and the future React Native / native mobile client
 *     will both talk to the same Spring Boot REST API. Keeping the transport
 *     behind a tiny module means we can later swap `fetch` for the platform
 *     equivalent on mobile without touching call-sites.
 *   - The wrapper centralises:
 *       • base URL (read from `NEXT_PUBLIC_API_BASE_URL` so it can be
 *         configured per environment — local, staging, production),
 *       • JSON content negotiation,
 *       • Authorisation header injection,
 *       • a single place to surface backend error envelopes (the Spring
 *         `GlobalExceptionHandler` produces `{ success, message, errorCode }`).
 *   - We deliberately DO NOT throw on non-2xx responses because many call sites
 *     want to render `message` inline rather than crash. Callers can read the
 *     `ok` flag and `error` field on `ApiResult<T>` instead.
 */

const DEFAULT_BASE_URL = "http://localhost:8080";

function resolveBaseUrl(): string {
  const fromEnv =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/+$/, "");
  return DEFAULT_BASE_URL;
}

export const API_BASE_URL = resolveBaseUrl();

export interface ApiSuccess<T> {
  ok: true;
  status: number;
  data: T;
}

export interface ApiFailure {
  ok: false;
  status: number;
  message: string;
  errorCode?: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  /** extra headers, e.g. Idempotency-Key */
  headers?: Record<string, string>;
}

/**
 * Shape returned by the Spring `GlobalExceptionHandler` for known errors.
 * The success paths (AuthController) currently return DTOs directly — we still
 * try to detect `ApiResponse<T>` wrappers so future endpoints can use them.
 */
interface BackendErrorEnvelope {
  success?: boolean;
  message?: string;
  errorCode?: string;
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const maybe = payload as BackendErrorEnvelope;
  if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message;
  return fallback;
}

function extractErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const maybe = payload as BackendErrorEnvelope;
  if (typeof maybe.errorCode === "string" && maybe.errorCode.trim()) return maybe.errorCode;
  return undefined;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "POST", body, token, signal, headers = {} } = options;

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      credentials: "omit",
      cache: "no-store",
    });
  } catch (networkError) {
    return {
      ok: false,
      status: 0,
      message:
        networkError instanceof Error
          ? networkError.message
          : "Network error. Please try again.",
    };
  }

  // 204 No Content etc — treat as success with undefined data
  if (response.status === 204) {
    return { ok: true, status: 204, data: undefined as T };
  }

  let payload: unknown = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (response.ok) {
    return { ok: true, status: response.status, data: payload as T };
  }

  return {
    ok: false,
    status: response.status,
    message: extractMessage(payload, response.statusText || "Request failed"),
    errorCode: extractErrorCode(payload),
  };
}
