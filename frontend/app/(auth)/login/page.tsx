"use client";

import { useEffect, useState } from "react";

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
import OrDivider from "@/components/auth/OrDivider";
import PasswordField from "@/components/auth/PasswordField";
import SocialAuthButton from "@/components/auth/SocialAuthButton";
import {
  validateLoginEmail,
  validateLoginPassword,
} from "@/components/auth/validation";

import useAuthStore from "@/store/authStore";

/**
 * NEXTCART — /login
 *
 * Mobile-first responsive login. Validation runs on submit (and on blur when
 * a field has been touched) so the user sees feedback without us yelling at
 * them while they type.
 *
 * Architectural notes:
 *   - We delegate the HTTP call to `useAuthStore.login`. The store talks to
 *     `services/authService`, which talks to Spring Boot `POST /api/v1/auth/login`.
 *     The same `authService` will be reused by the React Native mobile app,
 *     so any future tweak to the backend wire format happens in one place.
 *   - On success we `router.push("/")` — the home page. There is intentionally
 *     no onboarding, no shipping setup, and no email verification step.
 *   - The "Forgot password?" link points to `/forgot-password`, which is a
 *     polite placeholder for now (it shares the same auth layout).
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Field-level errors (rendered inline next to each field).
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Touched tracking lets us validate on blur only after the user actually
  // interacted with the field, avoiding a wall of red on first render.
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Reset any stale store error when the user lands on the page (e.g. after
  // a failed signup that bounced to /login with an error still in memory).
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateLoginEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validateLoginPassword(password));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const e = validateLoginEmail(email);
    const p = validateLoginPassword(password);
    setEmailError(e);
    setPasswordError(p);
    setEmailTouched(true);
    setPasswordTouched(true);
    if (e || p) return;

    const result = await login(email.trim(), password);
    if (result.ok) {
      router.push("/");
    }
    // On failure the store has populated `error`, which we render in <Alert/>.
  };

  const formIsIncomplete = !email.trim() || !password;

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue shopping smarter."
      footer={
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{" "}
          <MuiLink
            component={Link}
            href="/signup"
            sx={{ fontWeight: 600 }}
          >
            Create account
          </MuiLink>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error ? (
            <Alert severity="error" variant="outlined" role="alert">
              {error}
            </Alert>
          ) : null}

          <TextField
            name="email"
            label="Email"
            placeholder="you@example.com"
            type="email"
            autoComplete="username"
            inputMode="email"
            fullWidth
            size="small"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailTouched) setEmailError(validateLoginEmail(e.target.value));
              if (error) clearError();
            }}
            onBlur={handleEmailBlur}
            error={Boolean(emailError)}
            helperText={emailTouched ? emailError ?? " " : " "}
          />

          <Box>
            <PasswordField
              name="password"
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordTouched)
                  setPasswordError(validateLoginPassword(e.target.value));
                if (error) clearError();
              }}
              onBlur={handlePasswordBlur}
              error={Boolean(passwordError)}
              helperText={passwordTouched ? passwordError ?? " " : " "}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
              <MuiLink
                component={Link}
                href="/forgot-password"
                variant="caption"
                sx={{ fontWeight: 600 }}
              >
                Forgot Password?
              </MuiLink>
            </Box>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || formIsIncomplete}
            sx={{
              py: 1.125,
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: 1,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          <OrDivider />

          <SocialAuthButton />
        </Stack>
      </Box>
    </AuthCard>
  );
}
