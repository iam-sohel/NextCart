/**
 * NEXTCART — useAuthHydrated
 *
 * True once the auth store has restored its persisted state on the client.
 *
 * Why this exists:
 *   The auth store is configured with `skipHydration` (see
 *   `store/authStore.ts`) and is rehydrated explicitly by
 *   `AuthClientBootstrap` inside its mount effect — i.e. AFTER the first
 *   client paint. Until that runs, `token` / `user` are always null even
 *   for a genuinely logged-in user (the session lives in localStorage).
 *
 *   Any authentication decision made before hydration completes therefore
 *   misclassifies a logged-in user as a guest. `hooks/useRequireAuth.ts`
 *   already follows this rule for protected pages; this hook lets event
 *   handlers (e.g. the wishlist buttons) apply the same rule at click time:
 *
 *     not hydrated yet  → WAIT (ignore the click; decide nothing)
 *     hydrated + token  → authenticated action
 *     hydrated, no token → login redirect
 *
 * Implementation notes:
 *   - `useAuthStore.persist.hasHydrated()` is the live status.
 *   - `onFinishHydration` re-fires subscribed components the moment
 *     rehydration completes, so no polling or timers are involved.
 *   - The server snapshot is `true` because SSR never has a pending
 *     localStorage restore — matching the store's first-paint state keeps
 *     server/client markup identical (no hydration mismatch).
 */

"use client";

import { useSyncExternalStore } from "react";

import useAuthStore from "@/store/authStore";

const subscribe = (onStoreChange: () => void) =>
  useAuthStore.persist.onFinishHydration(onStoreChange);

const getSnapshot = () => useAuthStore.persist.hasHydrated();

const getServerSnapshot = () => true;

export function useAuthHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useAuthHydrated;
