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
}interface BackendErrorEnvelope {
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
type TokenGetter = () => string | null;
type AuthFailureNotifier = (status: number, payload: unknown) => void;

let getTokenFn: TokenGetter | null = null;
let notifyAuthFailureFn: AuthFailureNotifier | null = null;

export function registerAuthTokenGetter(fn: TokenGetter): () => void {
  getTokenFn = fn;
  return () => {
    if (getTokenFn === fn) getTokenFn = null;
  };
}

export function registerAuthFailureHandler(fn: AuthFailureNotifier): () => void {
  notifyAuthFailureFn = fn;
  return () => {
    if (notifyAuthFailureFn === fn) notifyAuthFailureFn = null;
  };
}

function resolveToken(explicit: string | null | undefined): string | null {
  if (explicit === null) return null; // explicit suppression
  if (typeof explicit === "string" && explicit.length > 0) return explicit;
  if (getTokenFn) {
    try {
      return getTokenFn();
    } catch {
      return null;
    }
  }
  return null;
}

/* ──────────────────────────────────────────────────────────────────────
   Public request function
   ────────────────────────────────────────────────────────────────────── */

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "POST", body, token, signal, headers = {} } = options;

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const resolvedToken = resolveToken(token);
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...headers,
  };
  if (resolvedToken) finalHeaders["Authorization"] = `Bearer ${resolvedToken}`;

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

  // Hand off 401 to the global handler if one is registered. We deliberately
  // do NOT throw — call sites already handle `ok: false` uniformly, and the
  // interceptor will navigate + clear auth on its own.
  if (response.status === 401 && notifyAuthFailureFn) {
    try {
      notifyAuthFailureFn(response.status, payload);
    } catch {
      // Interceptor errors must not break the caller's error flow.
    }
  }

  return {
    ok: false,
    status: response.status,
    message: extractMessage(payload, response.statusText || "Request failed"),
    errorCode: extractErrorCode(payload),
  };
}
