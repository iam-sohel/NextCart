/**
 * NEXTCART — Auth store (Zustand)
 *
 * This is the single Zustand store for authentication state. The login
 * and signup pages, the navbar account menu, and protected route guards
 * all read from / write to this store.
 *
 * Design notes:
 *   - `user` is the domain user object on success. `null` means "guest".
 *   - `token` is the JWT bearer token.
 *   - `refreshToken` is the opaque, rotating refresh token.
 *   - Persistence stores only durable authentication/session information.
 *   - `hasHydrated` flips to true only after rehydration runs on the client.
 *   - `loading` is per-action so the UI can disable just the submit button.
 *   - `error` carries the latest backend / network message.
 *
 * Registration flow:
 *   1. register()
 *   2. verifyEmailOtp() OR verifyPhoneOtp()
 *   3. completeRegistration()
 *   4. redirect to /login
 *
 * IMPORTANT:
 *   Registration does NOT authenticate the user.
 *   Only login() establishes an authenticated session.
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
      emailOrPhone: string,
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

  verifyEmailOtp: (
      email: string,
      otp: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;

  /**
   * For phone registration, the second parameter is the
   * MSG91 Widget access token, NOT the OTP.
   */
  verifyPhoneOtp: (
      phone: string,
      accessToken: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;

  completeRegistration: (
      email?: string,
      phone?: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;

  sendEmailVerificationOtp: (
      email: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;

  /**
   * Kept for compatibility with the existing SignupPage.
   *
   * MSG91 Widget itself sends the phone OTP.
   * Therefore this method does NOT call a backend API.
   */
  sendPhoneVerificationOtp: (
      phone: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
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

          /**
           * These values belong only to the current registration flow.
           * They are intentionally excluded from partialize() below.
           */
          emailVerified: false,
          phoneVerified: false,

          /* ────────────────────────────────────────────────────────────────
             LOGIN
             ──────────────────────────────────────────────────────────────── */

          async login(emailOrPhone, password) {
            set({
              loading: true,
              isAuthenticating: true,
              error: null,
            });

            const isPhone = /^[6-9]\d{9}$/.test(
                emailOrPhone.trim(),
            );

            const result = await authService.login({
              ...(isPhone
                  ? { phone: emailOrPhone.trim() }
                  : { email: emailOrPhone.trim() }),
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

            /**
             * Login is the ONLY point where the authenticated user and
             * authentication tokens are established.
             */
            set({
              token: result.data.token,
              refreshToken: result.data.refreshToken,
              user: result.data.user ?? {
                firstName: "",
                lastName: "",
                email: isPhone ? "" : emailOrPhone,
                phone: isPhone ? emailOrPhone : "",
              },
              loading: false,
              isAuthenticating: false,
              error: null,

              /**
               * Registration verification state is no longer relevant
               * after successful authentication.
               */
              emailVerified: false,
              phoneVerified: false,
            });

            return { ok: true };
          },

          /* ────────────────────────────────────────────────────────────────
             REGISTER
             ──────────────────────────────────────────────────────────────── */

          async register(
              firstName,
              lastName,
              email,
              phone,
              password,
          ) {
            /**
             * Registration starts a new verification flow.
             *
             * It does NOT mean the user is authenticated.
             */
            set({
              loading: true,
              isAuthenticating: false,
              error: null,
              emailVerified: false,
              phoneVerified: false,
            });

            const result = await authService.register({
              firstName,
              lastName,
              email: email || undefined,
              phone: phone || undefined,
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

            /**
             * IMPORTANT:
             *
             * Registration does NOT authenticate the user.
             *
             * Do not store result.data.user.
             * Do not create authentication tokens.
             *
             * The user must complete verification and then explicitly
             * authenticate through login().
             */
            set({
              user: null,
              token: null,
              refreshToken: null,
              loading: false,
              isAuthenticating: false,
              error: null,
            });

            return { ok: true };
          },

          /* ────────────────────────────────────────────────────────────────
             LOGOUT
             ──────────────────────────────────────────────────────────────── */

          logout() {
            /**
             * Backend logout deletes the refresh token server-side.
             *
             * The access JWT is stateless and remains valid until expiration,
             * so client-side removal of both tokens ends the local session.
             */
            void authService.logout();

            set({
              user: null,
              token: null,
              refreshToken: null,
              error: null,
              loading: false,
              isAuthenticating: false,

              /**
               * Verification state belongs to registration only.
               */
              emailVerified: false,
              phoneVerified: false,
            });
          },

          /* ────────────────────────────────────────────────────────────────
             TOKEN REFRESH
             ──────────────────────────────────────────────────────────────── */

          applyRefreshedTokens(accessToken, refreshToken) {
            /**
             * Replace the rotated credentials while preserving
             * the authenticated user profile.
             */
            set({
              token: accessToken,
              refreshToken,
            });
          },

          /* ────────────────────────────────────────────────────────────────
             EMAIL VERIFICATION
             ──────────────────────────────────────────────────────────────── */

          setEmailVerified(value) {
            set({
              emailVerified: value,
            });
          },

          async verifyEmailOtp(email: string, otp: string) {
            const result = await authService.verifyEmailOtp(
                email,
                otp,
            );

            if (!result.ok) {
              set({
                error: result.message,
              });

              return {
                ok: false,
                message: result.message,
              };
            }

            /**
             * The backend verification succeeded.
             *
             * This method owns emailVerified state.
             */
            set({
              emailVerified: true,
              error: null,
            });

            return { ok: true };
          },

          /* ────────────────────────────────────────────────────────────────
             PHONE VERIFICATION
             ──────────────────────────────────────────────────────────────── */

          setPhoneVerified(value) {
            set({
              phoneVerified: value,
            });
          },

          async verifyPhoneOtp(
              phone: string,
              accessToken: string,
          ) {
            const result = await authService.verifyPhoneOtp(
                phone,
                accessToken,
            );

            if (!result.ok) {
              set({
                error: result.message,
              });

              return {
                ok: false,
                message: result.message,
              };
            }

            /**
             * The backend verification succeeded.
             *
             * This method owns phoneVerified state.
             */
            set({
              phoneVerified: true,
              error: null,
            });

            return { ok: true };
          },

          /* ────────────────────────────────────────────────────────────────
             COMPLETE REGISTRATION
             ──────────────────────────────────────────────────────────────── */

          async completeRegistration(
              email?: string,
              phone?: string,
          ) {
            /**
             * Backend accepts exactly one identifier:
             * email OR phone.
             */
            const result =
                await authService.completeRegistration(
                    email || undefined,
                    phone || undefined,
                );

            if (!result.ok) {
              set({
                error: result.message,
              });

              return {
                ok: false,
                message: result.message,
              };
            }

            /**
             * IMPORTANT:
             *
             * Completing registration does NOT authenticate the user.
             *
             * Do not store result.data.user.
             * Do not create or retain authentication tokens.
             *
             * The user should be redirected to /login.
             */
            set({
              user: null,
              token: null,
              refreshToken: null,
              error: null,
              emailVerified: false,
              phoneVerified: false,
            });

            return { ok: true };
          },

          /* ────────────────────────────────────────────────────────────────
             SEND EMAIL VERIFICATION OTP
             ──────────────────────────────────────────────────────────────── */

          async sendEmailVerificationOtp(email: string) {
            const result =
                await authService.sendEmailVerificationOtp(
                    email,
                );

            if (!result.ok) {
              set({
                error: result.message,
              });

              return {
                ok: false,
                message: result.message,
              };
            }

            set({
              error: null,
            });

            return { ok: true };
          },

          /* ────────────────────────────────────────────────────────────────
             SEND PHONE VERIFICATION OTP
             ──────────────────────────────────────────────────────────────── */

          async sendPhoneVerificationOtp(phone: string) {
            /**
             * MSG91 Widget handles sending the OTP.
             *
             * No backend `/phone/send-otp` API is called.
             *
             * Keeping this method prevents the existing SignupPage
             * from breaking until its MSG91 Widget integration is wired.
             */
            if (!phone || !phone.trim()) {
              const message = "Phone number is required.";

              set({
                error: message,
              });

              return {
                ok: false,
                message,
              };
            }

            set({
              error: null,
            });

            return { ok: true };
          },

          /* ────────────────────────────────────────────────────────────────
             ERROR / HYDRATION
             ──────────────────────────────────────────────────────────────── */

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

          /**
           * Persist only durable authentication/session information.
           *
           * DO NOT persist:
           *   - loading
           *   - error
           *   - isAuthenticating
           *   - hasHydrated
           *   - emailVerified
           *   - phoneVerified
           */
          partialize: (state) => ({
            token: state.token,
            refreshToken: state.refreshToken,
            user: state.user,
          }),

          /**
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