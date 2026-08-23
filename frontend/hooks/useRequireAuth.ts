/**
 * NEXTCART — useRequireAuth
 *
 * Hydration-safe client-side route guard for pages that require a logged-in
 * user (checkout, account/addresses, and later orders).
 *
 * Why a hook (and why it waits for hydration):
 *   The auth token is restored from localStorage on the client AFTER the
 *   first paint (see `store/authStore.ts` — `skipHydration` + explicit
 *   rehydrate in `AuthClientBootstrap`). If a guard checked `token` before
 *   rehydration finished, a genuinely logged-in user would be redirected to
 *   /login on every hard refresh. So we hold until `hasHydrated` is true,
 *   then decide once.
 *
 * Usage:
 *   const { checking, authed } = useRequireAuth("/checkout");
 *   // optionally render a lightweight placeholder while `checking`.
 *
 * This centralizes the redirect target/query the app already uses
 * (`/login?reason=login-required&return=<path>`) so every protected page
 * behaves identically. It does not protect public pages — callers opt in.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";

export interface RequireAuthState {
  /** True until localStorage rehydration has completed — decision pending. */
  checking: boolean;
  /** True only once hydration is done AND a token is present. */
  authed: boolean;
}

export function useRequireAuth(returnPath: string): RequireAuthState {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    // Only redirect once we actually know the auth state.
    if (hasHydrated && !token) {
      router.replace(
        `/login?reason=login-required&return=${encodeURIComponent(returnPath)}`,
      );
    }
  }, [hasHydrated, token, router, returnPath]);

  return {
    checking: !hasHydrated,
    authed: hasHydrated && Boolean(token),
  };
}

export default useRequireAuth;
