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
 *   - `refreshToken` is the opaque, rotating refresh token. When `lib/api.ts`
 *     sees an authenticated request rejected (the access token has expired),
 *     it calls the registered refresher (`lib/tokenRefresh.ts`), which trades
 *     this refresh token for a fresh access token + a new refresh token and
 *     writes both back here via `applyRefreshedTokens`.
 *   - Persistence: the backend is a STATELESS bearer-JWT API. The access
 *     token and refresh token are persisted with the user profile so the
 *     session survives a page reload.
 *   - `hasHydrated` flips to true only after rehydration runs on the client.
 *   - `loading` is per-action so the UI can disable just the submit button.
 *   - `error` carries the latest backend / network message; `clearError()`
 *     lets the UI reset between attempts.
 */

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { authService, type AuthUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;

  /** True while a backend request is in-flight. */
  isAuthenticating: boolean;

  /** True once localStorage rehydration has completed on the client. */
  hasHydrated: boolean;

  /** Email verification status for pending registration flow. */
  emailVerified: boolean;

  /** Phone verification status for pending registration flow. */
  phoneVerified: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;

  register: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;

  logout: () => void;

  /**
   * Replace the access + refresh tokens after a successful silent refresh.
   * The logged-in user profile remains unchanged.
   */
  applyRefreshedTokens: (
    accessToken: string,
    refreshToken: string,
  ) => void;

  clearError: () => void;

  setHasHydrated: (value: boolean) => void;

  /**
   * Update email verification status during registration flow.
   * Does NOT persist to localStorage — transient flow state.
   */
  setEmailVerified: (value: boolean) => void;

  /**
   * Update phone verification status during registration flow.
   * Does NOT persist to localStorage — transient flow state.
   */
  setPhoneVerified: (value: boolean) => void;

  verifyEmailOtp: (email: string, otp: string) => Promise<{ ok: true } | { ok: false; message: string }>;

  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ ok: true } | { ok: false; message: string }>;

  completeRegistration: (email: string, phone: string) => Promise<{ ok: true } | { ok: false; message: string }>;

  sendEmailVerificationOtp: (email: string) => Promise<{ ok: true } | { ok: false; message: string }>;

  sendPhoneVerificationOtp: (phone: string) => Promise<{ ok: true } | { ok: false; message: string }>;

}

/* ──────────────────────────────────────────────────────────────────────
   Auth state persistent via Zustand
   ────────────────────────────────────────────────────────────────────── */

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
      isAuthenticating: false,
      hasHydrated: false,
      emailVerified: false,
      phoneVerified: false,

      // `lib/authInterceptor.ts` reads the live token via
      // `useAuthStore.getState().token` on every authenticated request.

      async login(email, password) {
        set({
          loading: true,
          isAuthenticating: true,
          error: null,
        });

        const result = await authService.login({
          email,
          password,
        });

        if (!result.ok) {
          set({
            loading: false,
            isAuthenticating: false,
            error: result.message,
          });

          return {
            ok: false,
            message: result.message,
          };
        }

        /*
         * The backend login endpoint now returns the authenticated user's
         * profile together with the access and refresh tokens.
         *
         * This is important because the frontend previously created:
         *
         *   { firstName: "", lastName: "", email }
         *
         * which caused the logged-in user's name to be blank.
         *
         * We now use the authoritative user object returned by the backend.
         */
        set({
          token: result.data.token,
          refreshToken: result.data.refreshToken,
          user: result.data.user ?? {
            firstName: "",
            lastName: "",
            email,
          },
          loading: false,
          isAuthenticating: false,
          error: null,
        });

        return { ok: true };
      },

      async register(firstName, lastName, email, phone, password) {
        set({
          loading: true,
          isAuthenticating: true,
          error: null,
        });

        const result = await authService.register({
          firstName,
          lastName,
          email,
          phone,
          password,
        });

        if (!result.ok) {
          set({
            loading: false,
            isAuthenticating: false,
            error: result.message,
          });

          return {
            ok: false,
            message: result.message,
          };
        }

        /*
         * Registration does not return authentication tokens.
         * The user is sent to /login to authenticate.
         *
         * We retain the returned profile in the store, but login will
         * replace it with the authoritative profile returned by the
         * login endpoint.
         */
        set({
          user: result.data.user,
          loading: false,
          isAuthenticating: false,
          error: null,
        });

        return { ok: true };
      },

      logout() {
        /*
         * Backend logout deletes the refresh token server-side.
         *
         * The access JWT is stateless and remains valid until expiration,
         * so client-side removal of both tokens is still authoritative
         * for ending the local session.
         */
        void authService.logout();

        set({
          user: null,
          token: null,
          refreshToken: null,
          error: null,
        });
      },

      applyRefreshedTokens(accessToken, refreshToken) {
        /*
         * Swap in the rotated credentials from a silent refresh.
         *
         * The user profile is deliberately preserved because refreshing
         * credentials does not change the authenticated user.
         */
        set({
          token: accessToken,
          refreshToken,
        });
      },

      setEmailVerified(value) {
        set({
          emailVerified: value,
        });
      },

      setPhoneVerified(value) {
        set({
          phoneVerified: value,
        });
      },

      async verifyEmailOtp(email: string, otp: string) {
        const result = await authService.verifyEmailOtp(email, otp);
        if (!result.ok) {
          set({
            error: result.message,
          });
          return { ok: false, message: result.message };
        }
        set({
          emailVerified: true,
        });
        return { ok: true };
      },

      async verifyPhoneOtp(phone: string, otp: string) {
        const result = await authService.verifyPhoneOtp(phone, otp);
        if (!result.ok) {
          set({
            error: result.message,
          });
          return { ok: false, message: result.message };
        }
        set({
          phoneVerified: true,
        });
        return { ok: true };
      },

      async completeRegistration(email: string, phone: string) {
        const result = await authService.completeRegistration(email, phone);
        if (!result.ok) {
          set({
            error: result.message,
          });
          return { ok: false, message: result.message };
        }
        // Registration complete - user is created but not automatically logged in.
        // They should be redirected to /login to authenticate.
        set({
          user: result.data.user,
          error: null,
        });
        return { ok: true };
      },

      async sendEmailVerificationOtp(email: string) {
        const result = await authService.sendEmailVerificationOtp(email);
        if (!result.ok) {
          set({
            error: result.message,
          });
          return { ok: false, message: result.message };
        }
        return { ok: true };
      },

      async sendPhoneVerificationOtp(phone: string) {
        const result = await authService.sendPhoneVerificationOtp(phone);
        if (!result.ok) {
          set({
            error: result.message,
          });
          return { ok: false, message: result.message };
        }
        return { ok: true };
      },

      clearError() {
        set({
          error: null,
        });
      },

      setHasHydrated(value) {
        set({
          hasHydrated: value,
        });
      },
    }),
    {
      name: "nextcart-auth",

      storage: createJSONStorage(() => localStorage),

      /*
       * Persist only durable authentication/session information.
       *
       * Do not persist transient UI state such as:
       *   loading
       *   error
       *   isAuthenticating
       *   hasHydrated
       */
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),

      /*
       * Rehydration is triggered explicitly on the client through
       * AuthClientBootstrap.
       */
      skipHydration: true,

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useAuthStore;