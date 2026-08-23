/**
 * NEXTCART — Auth failure interceptor
 *
 * Receives every 401 surfaced by `lib/api.ts` and turns it into a single
 * side-effect: clear the in-memory auth store and navigate the user to
 * `/login?reason=session-expired`.
 *
 * Why a separate module?
 *   - `lib/api.ts` must stay framework-agnostic; we don't want a direct
 *     React / Next.js import in the HTTP layer.
 *   - Routing belongs in client components. A tiny client-only registrar
 *     (`<AuthClientBootstrap />`) wires the handler on app boot.
 *
 * Concurrency:
 *   - Multiple in-flight calls can 401 simultaneously (cart + wishlist +
 *     addresses may all be requested on page load). Without dedupe the
 *     router.push would fire several times and the store would be cleared
 *     multiple times — harmless but noisy. We dedupe with a short in-flight
 *     flag that resets on the next animation frame so the next genuine
 *     401 after recovery is still handled.
 */

"use client";

import { useEffect } from "react";

import { useRouter, usePathname } from "next/navigation";

import {
  registerAuthFailureHandler,
  registerAuthTokenGetter,
} from "@/lib/api";
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
      unregisterHandler();
    };
  }, [router, pathname]);

  return null;
}
