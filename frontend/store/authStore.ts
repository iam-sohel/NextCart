/**
 * NEXTCART — Auth store (Zustand)
 *
 * This is the single Zustand store for authentication state. The login
 * and signup pages, the navbar account menu, and (later) protected route
 * guards all read from / write to this store.
 *
 * Design notes:
 *   - `user` is the domain user object on success. `null` means "guest".
 *   - `token` is held in memory only. We deliberately do NOT persist it to
 *     localStorage here: doing so would expose the JWT to XSS. The safer
 *     production path is an HttpOnly cookie issued by Spring Boot — when the
 *     backend rolls that out we will swap this for a cookie-aware initializer.
 *     Components should treat the token as transient (e.g. attach via a
 *     `getToken` accessor on demand, never assume it survives reloads).
 *   - `loading` is per-action so the UI can disable just the submit button
 *     without blocking other interactions.
 *   - `error` carries the latest backend / network message; the page renders
 *     it under the form so the user can correct the input. `clearError()`
 *     lets the UI reset between attempts.
 *
 * Actions vs imperative calls:
 *   The store does NOT bundle the HTTP call. Pages call the store actions
 *   which delegate to `services/authService` and then update state. Keeping
 *   the API call in `services/` means the same call can be re-used from a
 *   server component, a custom hook, or — later — a React Native screen
 *   without depending on React.
 */

"use client";

import { create } from "zustand";

import { authService, type AuthUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  /** True while a backend request is in-flight. */
  isAuthenticating: boolean;

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
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticating: false,

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
      // The login endpoint does not return user details — the user object is
      // populated when a /me endpoint is added. We leave it null for now so
      // the UI clearly knows the user is authenticated but un-profiled.
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

    set({
      user: result.data.user,
      loading: false,
      isAuthenticating: false,
      error: null,
    });

    return { ok: true };
  },

  logout() {
    set({ user: null, token: null, error: null });
  },

  clearError() {
    set({ error: null });
  },
}));

export default useAuthStore;
