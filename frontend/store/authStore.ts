/**
 * NEXTCART — Auth store (Zustand)
 *
 * This is the single Zustand store for authentication state. The login
 * and signup pages, the navbar account menu, and protected route guards
 * all read from / write to this store.
 *
 * Design notes:
 *   - `user` is the domain user object on success. `null` means "guest".
 *   - `token` is the JWT bearer token. `lib/api.ts` reads it via the
 *     registered token-getter and sends it as `Authorization: Bearer …`.
 *   - Persistence: the backend is a STATELESS bearer-JWT API (confirmed from
 *     the Spring Security config) — it issues no HttpOnly cookie and no
 *     refresh token, and it is owned by another team. To make the session
 *     survive a page reload (required for cart/wishlist/checkout/addresses,
 *     which all need the token), we persist `{ token, user }` with Zustand's
 *     `persist` middleware backed by localStorage. This is the conventional
 *     bearer-token SPA pattern; it does NOT invent a new auth protocol. The
 *     known trade-off is XSS exposure of the token — acceptable here given
 *     (a) the backend offers no cookie alternative and (b) the token expires
 *     in 24h. `partialize` guarantees only token+user are stored (never
 *     transient loading/error flags).
 *   - `hasHydrated` flips to true only after rehydration runs on the client.
 *     Route guards and the navbar wait for it so a logged-in user is never
 *     briefly redirected/flashed as a guest on the first client render, and
 *     so SSR (always guest) matches the first client paint (no hydration
 *     mismatch). We use `skipHydration` and trigger rehydration explicitly
 *     from `AuthClientBootstrap` on mount.
 *   - `loading` is per-action so the UI can disable just the submit button.
 *   - `error` carries the latest backend / network message; `clearError()`
 *     lets the UI reset between attempts.
 *
 * Actions vs imperative calls:
 *   The store does NOT bundle the HTTP call. Pages call the store actions
 *   which delegate to `services/authService` and then update state. Keeping
 *   the API call in `services/` means the same call can be re-used from a
 *   server component, a custom hook, or a React Native screen.
 */

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authService, type AuthUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  /** True while a backend request is in-flight. */
  isAuthenticating: boolean;

  /** True once localStorage rehydration has completed on the client. */
  hasHydrated: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;

  register: (
    fullName: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;

  logout: () => void;

  clearError: () => void;

  setHasHydrated: (value: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticating: false,
      hasHydrated: false,

      // `lib/authInterceptor.ts` reads the live token via
      // `useAuthStore.getState().token` on every authenticated request, so a
      // fresh login is reflected on the next call without re-subscribing.

      async login(email, password) {
        set({ loading: true, isAuthenticating: true, error: null });

        const result = await authService.login({ email, password });

        if (!result.ok) {
          set({
            loading: false,
            isAuthenticating: false,
            error: result.message,
          });
          return { ok: false, message: result.message };
        }

        set({
          token: result.data.token,
          // The login endpoint does not return user details and the backend
          // has no real /me endpoint, so we populate what we know (the email
          // the user just authenticated with). Names stay blank until/if the
          // backend exposes them — we do not fabricate them.
          user: { firstName: "", lastName: "", email },
          loading: false,
          isAuthenticating: false,
          error: null,
        });

        return { ok: true };
      },

      async register(fullName, email, phone, password) {
        set({ loading: true, isAuthenticating: true, error: null });

        const result = await authService.register({ fullName, email, phone, password });

        if (!result.ok) {
          set({
            loading: false,
            isAuthenticating: false,
            error: result.message,
          });
          return { ok: false, message: result.message };
        }

        // Register does NOT return a token — the user is sent to /login to
        // sign in. We store the returned profile so a subsequent login can
        // show their name if the backend ever returns it.
        set({
          user: result.data.user,
          loading: false,
          isAuthenticating: false,
          error: null,
        });

        return { ok: true };
      },

      logout() {
        // The backend logout is stateless/advisory (it clears the server
        // security context but the JWT stays valid until expiry), so the
        // authoritative client-side logout is dropping the token here. We
        // still notify the backend best-effort (fire-and-forget) to match
        // the documented contract, without blocking the UI.
        void authService.logout();
        set({ user: null, token: null, error: null });
      },

      clearError() {
        set({ error: null });
      },

      setHasHydrated(value) {
        set({ hasHydrated: value });
      },
    }),
    {
      name: "nextcart-auth",
      // Guarded via createJSONStorage: on the server `localStorage` is
      // undefined and the factory throws, which the middleware catches and
      // treats as "no storage" — so SSR never crashes.
      storage: createJSONStorage(() => localStorage),
      // Never persist transient UI state — only the durable session.
      partialize: (state) => ({ token: state.token, user: state.user }),
      // Rehydrate explicitly on the client (from AuthClientBootstrap) so the
      // first client render matches SSR before the token is applied.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useAuthStore;
