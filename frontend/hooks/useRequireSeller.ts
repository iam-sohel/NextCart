/**
 * NEXTCART — useRequireSeller
 *
 * Hydration-safe client-side route guard for the seller panel (`/seller/**`).
 *
 * Decision rules (only evaluated AFTER localStorage rehydration):
 *   - no token                          → redirect to the existing
 *                                         login-required flow
 *   - token + user.role !== "SELLER"    → redirect to "/"
 *   - token + user.role === "SELLER"    → allow
 *
 * Why it waits for hydration:
 *   The auth token and user are restored from localStorage on the client AFTER
 *   the first paint (see `store/authStore.ts` — `skipHydration` + explicit
 *   rehydrate in `AuthClientBootstrap`). Deciding before `hasHydrated` would
 *   misclassify a logged-in seller as a guest and bounce them to /login on
 *   every hard refresh. While hydration is pending, `checking` is true and the
 *   caller must not render protected content or redirect.
 *
 * Loop safety:
 *   The redirect targets are stable and mutually exclusive. Guests are sent
 *   to the configured login page, while non-sellers go to `/`. The hook
 *   never redirects while `checking`, so it cannot fire before the guard knows
 *   the real auth state.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";

const SELLER_ROLE = "SELLER";

export interface RequireSellerState {
  /** True until localStorage rehydration has completed — decision pending. */
  checking: boolean;
  /** True only once hydration is done AND the user is an authenticated seller. */
  isSeller: boolean;
}

export interface RequireSellerOptions {
  /**
   * Destination for unauthenticated seller-panel visitors.
   * Defaults to the shared login page so existing callers keep working.
   */
  loginPath?: string;
}

export function useRequireSeller(
  returnPath: string,
  options?: RequireSellerOptions,
): RequireSellerState {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const isSeller =
    hasHydrated && Boolean(token) && user?.role === SELLER_ROLE;
  const loginPath = options?.loginPath ?? "/login";

  useEffect(() => {
    // Never decide before hydration completes.
    if (!hasHydrated) return;

    if (!token) {
      router.replace(
        `${loginPath}?reason=login-required&return=${encodeURIComponent(returnPath)}`,
      );
      return;
    }

    if (user?.role !== SELLER_ROLE) {
      router.replace("/");
    }
  }, [hasHydrated, token, user, router, returnPath, loginPath]);

  return {
    checking: !hasHydrated,
    isSeller,
  };
}

export default useRequireSeller;
