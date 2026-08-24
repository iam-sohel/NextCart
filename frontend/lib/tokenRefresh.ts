/**
 * NEXTCART — Single-flight access-token refresher
 *
 * This is the bridge between the framework-agnostic HTTP layer (`lib/api.ts`)
 * and the auth session (`store/authStore.ts` + `services/authService.ts`).
 *
 * `lib/api.ts` calls `refreshAuthSession()` when an authenticated request is
 * rejected because the access token has lapsed. This module:
 *   1. Reads the current refresh token from the store.
 *   2. Exchanges it for a new access + refresh token via `authService`.
 *   3. Writes both back to the store (`applyRefreshedTokens`).
 *   4. Reports the outcome so the HTTP layer can retry, log out, or back off.
 *
 * Single-flight (concurrency guard) — the important part:
 *   On a page load, several authenticated requests (cart + wishlist +
 *   addresses …) can all be in flight and all come back rejected at once.
 *   Without coordination each would fire its own `/refresh` — and because the
 *   backend ROTATES the refresh token on every call (deleting the previous
 *   one), the second concurrent refresh would use an already-deleted token and
 *   fail, needlessly logging the user out. So we keep a single shared in-flight
 *   promise: the first caller starts the refresh, every concurrent caller
 *   awaits the SAME promise, and once it settles the guard resets. Result:
 *   exactly ONE `/refresh` network call, after which every pending request
 *   retries with the new token.
 *
 * The guard is reset only AFTER the store has been updated and the promise has
 * resolved, so any refresh that begins later reads the freshly rotated token
 * rather than a stale one.
 */

"use client";

import { type AuthRefreshOutcome } from "@/lib/api";
import { authService } from "@/services/authService";
import useAuthStore from "@/store/authStore";

let inFlight: Promise<AuthRefreshOutcome> | null = null;

async function performRefresh(): Promise<AuthRefreshOutcome> {
  const refreshToken = useAuthStore.getState().refreshToken;

  // No refresh token means there is nothing to refresh with — the session
  // cannot be renewed, so it is over.
  if (!refreshToken) return "session-expired";

  const res = await authService.refreshSession(refreshToken);

  if (res.ok) {
    useAuthStore.getState().applyRefreshedTokens(
      res.data.accessToken,
      res.data.refreshToken,
    );
    return "refreshed";
  }

  // Status 0 = the request never reached the server (offline / CORS). This is
  // transient: keep the session so the user can retry, and never loop.
  if (res.status === 0) return "network-error";

  // Any other failure (on this backend, a rejected/expired refresh token comes
  // back as HTTP 500) means the refresh token is no longer usable → the
  // session is genuinely over.
  return "session-expired";
}

/**
 * Refresh the access token, coalescing concurrent callers into a single
 * `/refresh` request. Safe to call from many simultaneously-failing requests.
 */
export function refreshAuthSession(): Promise<AuthRefreshOutcome> {
  if (!inFlight) {
    inFlight = performRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * Test/diagnostic helper: true while a refresh is in progress. Not used by app
 * code — exposed so the single-flight behavior can be asserted.
 */
export function isRefreshInFlight(): boolean {
  return inFlight !== null;
}
