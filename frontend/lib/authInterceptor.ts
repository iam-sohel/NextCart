/**
 * NEXTCART — Auth bootstrap + terminal auth-failure interceptor
 *
 * Mounted once on the client (`app/layout.tsx`). It wires three things into
 * the framework-agnostic HTTP layer (`lib/api.ts`):
 *   1. the live access-token getter (reads the Zustand store),
 *   2. the single-flight token refresher (`lib/tokenRefresh.ts`), and
 *   3. the terminal auth-failure handler.
 *
 * With the refresh flow in place, an expired access token is renewed silently
 * and the original request is retried — the user never notices. The failure
 * handler here is the LAST resort: it runs only when the refresher reports the
 * session is genuinely over (refresh token missing/invalid/expired). Its one
 * side-effect is to clear the in-memory auth store and navigate the user to
 * `/login?reason=session-expired`.
 *
 * Why a separate module?
 *   - `lib/api.ts` must stay framework-agnostic; we don't want a direct
 *     React / Next.js import in the HTTP layer.
 *   - Routing belongs in client components. A tiny client-only registrar
 *     (`<AuthClientBootstrap />`) wires the handlers on app boot.
 *
 * Concurrency:
 *   - Multiple in-flight calls can fail simultaneously (cart + wishlist +
 *     addresses may all be requested on page load). Refresh is coalesced into
 *     one call by `lib/tokenRefresh.ts`; and if the session is truly over,
 *     this handler dedupes the resulting redirect/clear with a short in-flight
 *     flag that resets on the next animation frame so the next genuine
 *     failure after recovery is still handled.
 */

"use client";

import { useEffect } from "react";

import { useRouter, usePathname } from "next/navigation";

import {
  registerAuthFailureHandler,
  registerAuthTokenGetter,
  registerTokenRefresher,
} from "@/lib/api";
import { refreshAuthSession } from "@/lib/tokenRefresh";
import useAuthStore from "@/store/authStore";

/** Routes that are themselves the "auth surface" — never redirect on these. */
const AUTH_ROUTES = new Set<string>(["/login", "/signup", "/forgot-password"]);

/**
 * Mount this once inside `app/layout.tsx`. It registers the failure handler
 * on the client only. Returns nothing — no UI, no children.
 */
export default function AuthClientBootstrap(): null {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Restore the persisted session from localStorage. The auth store is
    // configured with `skipHydration` so that SSR and the first client paint
    // both start as "guest" (preventing a hydration mismatch); we trigger
    // rehydration explicitly here on mount. When it finishes, the store's
    // `hasHydrated` flag flips to true and any guards waiting on it (see
    // `hooks/useRequireAuth`) and the navbar make their decision.
    void useAuthStore.persist.rehydrate();

    // Live token reader — always reflects the latest store value, including
    // updates after a fresh login. We don't subscribe to the store because
    // `apiRequest` reads this on every call.
    const unregisterToken = registerAuthTokenGetter(() =>
      useAuthStore.getState().token,
    );

    // Provide the single-flight refresher that `lib/api.ts` uses to silently
    // renew an expired access token and retry the request. The failure handler
    // below now fires ONLY when this refresher reports the session is truly
    // over (refresh token missing/invalid/expired) — a mere access-token lapse
    // is recovered transparently and never reaches the redirect.
    const unregisterRefresher = registerTokenRefresher(refreshAuthSession);

    let inFlight = false;
    const handleAuthFailure = (status: number) => {
      if (inFlight) return;
      inFlight = true;

      // If we are already on an auth route, do nothing — the user is
      // actively trying to authenticate, and bouncing them again would
      // erase any in-flight form state.
      const current =
        typeof window !== "undefined" ? window.location.pathname : pathname;
      if (current && AUTH_ROUTES.has(current)) {
        // Still clear the token so the next successful login starts clean.
        useAuthStore.getState().logout();
        // Defer resetting the flag so a fresh 401 from a *new* session still
        // fires after recovery.
        requestAnimationFrame(() => {
          inFlight = false;
        });
        return;
      }

      useAuthStore.getState().logout();
      router.push(`/login?reason=session-expired&status=${status}`);

      requestAnimationFrame(() => {
        inFlight = false;
      });
    };

    const unregisterHandler = registerAuthFailureHandler(handleAuthFailure);

    return () => {
      unregisterToken();
      unregisterRefresher();
      unregisterHandler();
    };
  }, [router, pathname]);

  return null;
}
