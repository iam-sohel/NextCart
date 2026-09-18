"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AuthCard from "@/components/auth/AuthCard";
import PasswordField from "@/components/auth/PasswordField";
import { validateLoginPassword } from "@/components/auth/validation";

import useAuthStore from "@/store/authStore";

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

function sellerReturnPath(): string {
  if (typeof window === "undefined") return "/seller";

  const requested = new URLSearchParams(window.location.search).get("return");
  if (
    requested &&
    requested.startsWith("/seller") &&
    !requested.startsWith("/seller/login") &&
    !requested.startsWith("/seller/signup")
  ) {
    return requested;
  }

  return "/seller";
}

export default function SellerLoginPage() {
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

  useEffect(() => {
    if (!hasHydrated) return;
    if (token && user?.role === "SELLER") {
      router.replace(sellerReturnPath());
    }
  }, [hasHydrated, token, user, router]);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search)
      .get("identifier")
      ?.trim();

    if (value && !validateIdentifier(value)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIdentifier(value);
    }
  }, []);

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
    const result = await login(loginIdentifier, password);
    if (!result.ok) {
      setSubmitting(false);
      return;
    }

    const session = useAuthStore.getState();
    if (!session.token || session.user?.role !== "SELLER") {
      logout();
      setSubmitting(false);
      setRoleError(
        "This account is not registered as a seller. Please use the appropriate account portal.",
      );
      return;
    }

    setSubmitting(false);
    router.replace(sellerReturnPath());
  };

  if (!hasHydrated) {
    return (
      <AuthCard
        title="Welcome back, Seller"
        subtitle="Checking your seller session"
      >
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Loading…
        </Typography>
      </AuthCard>
    );
  }

  const formIsIncomplete = !identifier.trim() || !password;

  return (
    <AuthCard
      title="Welcome back, Seller"
      subtitle="Sign in to your NextCart seller account"
      footer={
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have a seller account?{" "}
          <MuiLink
            component={Link}
            href="/seller/signup"
            sx={{ fontWeight: 600 }}
          >
            Create seller account
          </MuiLink>
        </Typography>
      }
    >
      <Stack spacing={3}>
        {roleError ? <Alert severity="error">{roleError}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Email or Mobile Number"
              placeholder="seller@example.com or 9876543210"
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
              name="seller-password"
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
            >
              {loading || submitting ? "Signing in…" : "Sign In"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </AuthCard>
  );
}
