"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AuthCard from "@/components/auth/AuthCard";
import PasswordField from "@/components/auth/PasswordField";
import { validateLoginPassword } from "@/components/auth/validation";

import useAuthStore from "@/store/authStore";

const ADMIN_ROLE = "ADMIN";
const ADMIN_LOGIN_ENDPOINT = "/api/v1/auth/admin/login" as const;
const INDIAN_PHONE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateIdentifier(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Email or mobile number is required.";

  const digits = trimmed.replace(/\D/g, "");
  if (INDIAN_PHONE_PATTERN.test(digits)) return null;
  if (EMAIL_PATTERN.test(trimmed) && trimmed.length <= 150) return null;

  return "Enter a valid email address or 10-digit mobile number.";
}

function adminReturnPath(): string {
  if (typeof window === "undefined") return "/admin";

  const requested = new URLSearchParams(window.location.search).get("return");
  if (
    requested &&
    (requested === "/admin" || requested.startsWith("/admin/")) &&
    requested !== "/admin/login" &&
    !requested.startsWith("/admin/login?") &&
    !requested.startsWith("/admin/login/")
  ) {
    return requested;
  }

  return "/admin";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout, loading, error, clearError } = useAuthStore();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionExpiredNotice] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("reason") ===
        "session-expired",
  );

  useEffect(() => {
    if (!hasHydrated) return;
    if (token && user?.role === ADMIN_ROLE) {
      router.replace(adminReturnPath());
    }
  }, [hasHydrated, token, user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || submitting) return;

    clearError();
    setRoleError(null);

    const nextIdentifierError = validateIdentifier(identifier);
    const nextPasswordError = validateLoginPassword(password);
    setIdentifierError(nextIdentifierError);
    setPasswordError(nextPasswordError);
    setIdentifierTouched(true);
    setPasswordTouched(true);
    if (nextIdentifierError || nextPasswordError) return;

    const digits = identifier.trim().replace(/\D/g, "");
    const loginIdentifier = INDIAN_PHONE_PATTERN.test(digits)
      ? digits
      : identifier.trim();

    setSubmitting(true);
    const result = await login(
      loginIdentifier,
      password,
      ADMIN_LOGIN_ENDPOINT,
    );
    if (!result.ok) {
      setSubmitting(false);
      return;
    }

    const session = useAuthStore.getState();
    if (!session.token || session.user?.role !== ADMIN_ROLE) {
      logout();
      setSubmitting(false);
      setRoleError(
        "This account does not have administrator access. Please use the appropriate account portal.",
      );
      return;
    }

    setSubmitting(false);
    router.replace(adminReturnPath());
  };

  if (!hasHydrated) {
    return (
      <AuthCard
        title="Admin sign in"
        subtitle="Checking your administrator session"
      >
        <Typography
          variant="body2"
          color="text.secondary"
          role="status"
          aria-live="polite"
          sx={{ textAlign: "center" }}
        >
          Checking your administrator session…
        </Typography>
      </AuthCard>
    );
  }

  const formIsIncomplete = !identifier.trim() || !password;

  return (
    <AuthCard
      title="Admin sign in"
      subtitle="Restricted NextCart administration"
      footer={
        <Typography variant="body2" color="text.secondary">
          Authorized administrators only.
        </Typography>
      }
    >
      <Stack spacing={3}>
        {sessionExpiredNotice ? (
          <Alert severity="info">
            Your administrator session has expired. Please sign in again.
          </Alert>
        ) : null}
        {roleError ? <Alert severity="error">{roleError}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Email or Mobile Number"
              placeholder="admin@example.com or 9876543210"
              autoComplete="username"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                if (identifierTouched) {
                  setIdentifierError(validateIdentifier(event.target.value));
                }
                clearError();
                setRoleError(null);
              }}
              onBlur={() => {
                setIdentifierTouched(true);
                setIdentifierError(validateIdentifier(identifier));
              }}
              error={identifierTouched && Boolean(identifierError)}
              helperText={identifierTouched && identifierError ? identifierError : " "}
              disabled={loading || submitting}
            />

            <PasswordField
              label="Password"
              name="admin-password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (passwordTouched) {
                  setPasswordError(validateLoginPassword(event.target.value));
                }
                clearError();
                setRoleError(null);
              }}
              onBlur={() => {
                setPasswordTouched(true);
                setPasswordError(validateLoginPassword(password));
              }}
              error={passwordTouched && Boolean(passwordError)}
              helperText={passwordTouched && passwordError ? passwordError : " "}
              disabled={loading || submitting}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || submitting || formIsIncomplete}
              sx={{ minHeight: 44 }}
            >
              {loading || submitting ? "Signing in…" : "Sign In"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </AuthCard>
  );
}
