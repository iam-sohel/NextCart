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

/**
 * Outcome of a token-refresh attempt, returned by the registered refresher
 * (see `registerTokenRefresher`). The HTTP layer stays framework-agnostic: it
 * only needs to know whether to (a) retry with a fresh token, (b) treat the
 * session as over and hand off to the auth-failure handler, or (c) leave the
 * session intact because refreshing failed for a transient reason.
 *
 *   - "refreshed"       → a new access token is now in place; retry once.
 *   - "session-expired" → the refresh token is missing/invalid/expired; the
 *                         session is genuinely over → clear + redirect.
 *   - "network-error"   → refresh could not reach the server (offline/CORS);
 *                         do NOT log the user out — surface the error and let
 *                         them retry. Never loops.
 */
export type AuthRefreshOutcome = "refreshed" | "session-expired" | "network-error";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
  /** extra headers, e.g. Idempotency-Key */
  headers?: Record<string, string>;
  /**
   * Opt this request OUT of the automatic 401/403/500 → refresh → retry flow.
   * Set on the auth endpoints themselves (login / register / refresh / logout)
   * so the refresh machinery is never triggered by — or recursed into — an
   * auth call. The `/refresh` call in particular MUST set this so a failed
   * refresh can never attempt to refresh itself.
   */
  skipAuthRefresh?: boolean;
  /**
   * Internal: marks a request that is already the single post-refresh retry.
   * Guarantees the "retry exactly once" contract and makes a refresh loop
   * (401 → refresh → 401 → refresh → …) structurally impossible. Not part of
   * the public API — callers never set this.
   */
  _isRetry?: boolean;
}

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

type TokenGetter = () => string | null;
type AuthFailureNotifier = (status: number, payload: unknown) => void;
type TokenRefresher = () => Promise<AuthRefreshOutcome>;

let getTokenFn: TokenGetter | null = null;
let notifyAuthFailureFn: AuthFailureNotifier | null = null;
let refreshTokenFn: TokenRefresher | null = null;

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

/**
 * Register the single-flight token refresher (provided by the client-only
 * auth bootstrap). When an authenticated request fails with an auth-shaped
 * status, `apiRequest` calls this to obtain a fresh access token before
 * retrying. Kept as a registered function — not a direct import — so this
 * module has no dependency on the store, the auth service, or React.
 */
export function registerTokenRefresher(fn: TokenRefresher): () => void {
  refreshTokenFn = fn;
  return () => {
    if (refreshTokenFn === fn) refreshTokenFn = null;
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

function notifyAuthFailure(status: number, payload: unknown): void {
  if (!notifyAuthFailureFn) return;
  try {
    notifyAuthFailureFn(status, payload);
  } catch {
    // Interceptor errors must not break the caller's error flow.
  }
}

/**
 * Statuses we treat as "the access token was not accepted" and therefore as
 * refresh-eligible. This backend does NOT emit a clean 401 for an expired
 * access token: its JWT filter has no try/catch, so an expired/invalid token
 * throws and surfaces as HTTP 500; a missing token surfaces as 403 (no custom
 * entry point). So we consider 401, 403 AND 500 — but only for requests that
 * actually carried an Authorization header (see `apiRequest`). This is safe on
 * this backend because access (24h) and refresh (7d) tokens are always issued
 * and rotated together, so a genuinely valid access token always has a valid
 * refresh token behind it: a genuine 500 with a live session refreshes fine,
 * retries once, and re-surfaces the real error — it never forces a logout.
 */
function isRefreshEligibleStatus(status: number): boolean {
  return status === 401 || status === 403 || status === 500;
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

  const failure: ApiFailure = {
    ok: false,
    status: response.status,
    message: extractMessage(payload, response.statusText || "Request failed"),
    errorCode: extractErrorCode(payload),
  };

  // ── Transparent access-token refresh ──────────────────────────────────
  // Only an authenticated request (one that actually sent a Bearer token) can
  // have its token rejected, so guest/public calls never enter this path. We
  // also skip the auth endpoints themselves and any request that is already
  // the single post-refresh retry (the `_isRetry` guard makes a refresh loop
  // impossible). A refresher must be registered.
  const authHeaderWasSent = Boolean(resolvedToken);
  const canAttemptRefresh =
    authHeaderWasSent &&
    !options.skipAuthRefresh &&
    !options._isRetry &&
    refreshTokenFn !== null &&
    isRefreshEligibleStatus(response.status);

  if (canAttemptRefresh) {
    let outcome: AuthRefreshOutcome;
    try {
      // Single-flight lives inside the refresher: many simultaneous 401s share
      // ONE refresh network call, then each retries with the new token.
      outcome = await refreshTokenFn!();
    } catch {
      // A throwing refresher is treated as a transient failure — never a loop,
      // never a silent logout.
      outcome = "network-error";
    }

    if (outcome === "refreshed") {
      // Retry EXACTLY once. `resolveToken` re-reads the live token getter, so
      // the retry automatically carries the freshly minted access token.
      return apiRequest<T>(path, { ...options, _isRetry: true });
    }

    if (outcome === "session-expired") {
      // Refresh token missing/invalid/expired → the session is genuinely over.
      notifyAuthFailure(response.status, payload);
    }
    // "network-error" → leave the session intact; just surface the failure.
    return failure;
  }

  // Terminal auth signal for a request that carried auth but is not (or is no
  // longer) refresh-eligible — e.g. the post-refresh retry still came back
  // 401/403, or no refresher is registered. A 500 here is left alone: it is a
  // genuine server error, not a reason to end the session.
  if (
    authHeaderWasSent &&
    !options.skipAuthRefresh &&
    (response.status === 401 || response.status === 403)
  ) {
    notifyAuthFailure(response.status, payload);
  }

  return failure;
}
