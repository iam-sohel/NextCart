/**
 * NEXTCART — useRequireAdmin
 *
 * Hydration-safe client-side route guard for the admin panel (`/admin/**`).
 *
 * Decision rules (only evaluated AFTER localStorage rehydration):
 *   - no token                       → redirect to admin login
 *   - token + user.role !== "ADMIN"  → redirect to "/"
 *   - token + user.role === "ADMIN"  → allow
 *
 * Why it waits for hydration:
 *   The auth token and user are restored from localStorage on the client AFTER
 *   the first paint (see `store/authStore.ts` — `skipHydration` + explicit
 *   rehydrate in `AuthClientBootstrap`). Deciding before `hasHydrated` would
 *   misclassify a logged-in admin as a guest and bounce them to login on
 *   every hard refresh. While hydration is pending, `checking` is true and the
 *   caller must not render protected content or redirect.
 *
 * Loop safety:
 *   The redirect targets are stable and mutually exclusive. Guests are sent
 *   to the configured login page, while non-admins go to `/`. The hook
 *   never redirects while `checking`, so it cannot fire before the guard knows
 *   the real auth state.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";

const ADMIN_ROLE = "ADMIN";

export interface RequireAdminState {
  /** True until localStorage rehydration has completed — decision pending. */
  checking: boolean;
  /** True only once hydration is done AND the user is an authenticated admin. */
  isAdmin: boolean;
}

export interface RequireAdminOptions {
  /**
   * Destination for unauthenticated admin-panel visitors.
   * Defaults to the admin login page.
   */
  loginPath?: string;
}

export function useRequireAdmin(
  returnPath: string,
  options?: RequireAdminOptions,
): RequireAdminState {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const isAdmin =
    hasHydrated && Boolean(token) && user?.role === ADMIN_ROLE;
  const loginPath = options?.loginPath ?? "/admin/login";

  useEffect(() => {
    // Never decide before hydration completes.
    if (!hasHydrated) return;

    if (!token) {
      router.replace(
        `${loginPath}?reason=login-required&return=${encodeURIComponent(returnPath)}`,
      );
      return;
    }

    if (user?.role !== ADMIN_ROLE) {
      router.replace("/");
    }
  }, [hasHydrated, token, user, router, returnPath, loginPath]);

  return {
    checking: !hasHydrated,
    isAdmin,
  };
}

export default useRequireAdmin;
