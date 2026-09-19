"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AuthCard from "@/components/auth/AuthCard";
import PasswordField from "@/components/auth/PasswordField";
import {
  validateConfirmPassword,
  validatePassword,
} from "@/components/auth/validation";

import { authService } from "@/services/authService";

type ResetMethod = "email" | "phone";
type ResetStep = 1 | 2 | 3 | 4;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_PHONE_PATTERN = /^[6-9]\d{9}$/;
const OTP_PATTERN = /^\d{6}$/;

/**
 * NEXTCART — /forgot-password
 *
 * Functional password-recovery flow backed by the existing Spring Boot
 * endpoints:
 *   1. POST /api/v1/auth/forgot-password        → sends a 6-digit OTP
 *   2. POST /api/v1/auth/forgot-password/verify-otp → returns a reset token
 *   3. POST /api/v1/auth/reset-password         → sets the new password
 *
 * The backend answers step 1 with success even when the account does not
 * exist (anti-enumeration), so the UI never promises that an OTP was sent —
 * it says "if the account exists".
 */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ResetStep>(1);
  const [method, setMethod] = useState<ResetMethod>("email");

  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState<string | null>(null);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [resetToken, setResetToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function validateIdentifier(raw: string): string | null {
    const value = raw.trim();
    if (!value) {
      return method === "email"
        ? "Email is required."
        : "Mobile number is required.";
    }
    if (method === "email") {
      if (!EMAIL_PATTERN.test(value) || value.length > 150) {
        return "Enter a valid email address.";
      }
      return null;
    }
    if (!INDIAN_PHONE_PATTERN.test(value.replace(/\D/g, ""))) {
      return "Enter a valid 10-digit mobile number.";
    }
    return null;
  }

  function identifierPayload(): { email?: string; phone?: string } {
    const value = identifier.trim();
    if (method === "email") return { email: value };
    return { phone: value.replace(/\D/g, "") };
  }

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const validationError = validateIdentifier(identifier);
    setIdentifierError(validationError);
    if (validationError) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    const result = await authService.forgotPassword(identifierPayload());
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setOtp("");
    setOtpError(null);
    setResetToken(null);
    setInfo(
      "If the account exists, a 6-digit verification code has been sent.",
    );
    setStep(2);
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const value = otp.trim();
    if (!OTP_PATTERN.test(value)) {
      setOtpError("Enter the 6-digit verification code.");
      return;
    }
    setOtpError(null);

    setSubmitting(true);
    setError(null);
    setInfo(null);

    const result = await authService.verifyResetOtp({
      ...identifierPayload(),
      otp: value,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setResetToken(result.data.resetToken);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setConfirmError(null);
    setStep(3);
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !resetToken) return;

    const nextPasswordError = validatePassword(newPassword);
    const nextConfirmError = validateConfirmPassword(
      confirmPassword,
      newPassword,
    );
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    if (nextPasswordError || nextConfirmError) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);

    const result = await authService.resetPassword({
      resetToken,
      newPassword,
      confirmPassword,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setStep(4);
  }

  const stepTitles: Record<ResetStep, { title: string; subtitle: string }> = {
    1: {
      title: "Reset your password",
      subtitle: "Enter your account email or mobile number.",
    },
    2: {
      title: "Enter verification code",
      subtitle: "Enter the 6-digit code we sent you.",
    },
    3: {
      title: "Choose a new password",
      subtitle: "Your new password must be at least 8 characters.",
    },
    4: {
      title: "Password reset",
      subtitle: "Your password has been updated.",
    },
  };

  return (
    <AuthCard
      title={stepTitles[step].title}
      subtitle={stepTitles[step].subtitle}
      footer={
        <Typography variant="body2" color="text.secondary">
          Remembered it?{" "}
          <MuiLink component={Link} href="/login" sx={{ fontWeight: 600 }}>
            Back to sign in
          </MuiLink>
        </Typography>
      }
    >
      <Stack spacing={2.5}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {info ? <Alert severity="info">{info}</Alert> : null}

        {step === 1 && (
          <Box component="form" onSubmit={handleSendOtp} noValidate>
            <Stack spacing={2.5}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={method}
                  onChange={(event) => {
                    setMethod(event.target.value as ResetMethod);
                    setIdentifier("");
                    setIdentifierError(null);
                    setError(null);
                  }}
                >
                  <FormControlLabel
                    value="email"
                    control={<Radio />}
                    label="Email"
                  />
                  <FormControlLabel
                    value="phone"
                    control={<Radio />}
                    label="Mobile"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                label={method === "email" ? "Email" : "Mobile number"}
                placeholder={
                  method === "email"
                    ? "Enter your email"
                    : "Enter 10-digit mobile number"
                }
                autoComplete={method === "email" ? "email" : "tel"}
                value={identifier}
                onChange={(event) => {
                  const value =
                    method === "phone"
                      ? event.target.value.replace(/\D/g, "").slice(0, 10)
                      : event.target.value;
                  setIdentifier(value);
                  if (identifierError) {
                    setIdentifierError(validateIdentifier(value));
                  }
                  setError(null);
                }}
                onBlur={() => setIdentifierError(validateIdentifier(identifier))}
                error={Boolean(identifierError)}
                helperText={identifierError ?? " "}
                disabled={submitting}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting || !identifier.trim()}
              >
                {submitting ? "Sending code…" : "Send verification code"}
              </Button>
            </Stack>
          </Box>
        )}

        {step === 2 && (
          <Box component="form" onSubmit={handleVerifyOtp} noValidate>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Verification code"
                placeholder="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);
                  setOtp(value);
                  if (otpError && OTP_PATTERN.test(value)) setOtpError(null);
                  setError(null);
                }}
                error={Boolean(otpError)}
                helperText={otpError ?? " "}
                disabled={submitting}
                slotProps={{ htmlInput: { maxLength: 6 } }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting || otp.trim().length !== 6}
              >
                {submitting ? "Verifying…" : "Verify code"}
              </Button>

              <Button
                type="button"
                fullWidth
                variant="text"
                disabled={submitting}
                onClick={() => {
                  setError(null);
                  setInfo(null);
                  setStep(1);
                }}
              >
                Use a different email or number
              </Button>
            </Stack>
          </Box>
        )}

        {step === 3 && (
          <Box component="form" onSubmit={handleResetPassword} noValidate>
            <Stack spacing={2.5}>
              <PasswordField
                label="New password"
                name="new-password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  if (passwordError) {
                    setPasswordError(validatePassword(event.target.value));
                  }
                  setError(null);
                }}
                onBlur={() => setPasswordError(validatePassword(newPassword))}
                error={Boolean(passwordError)}
                helperText={passwordError ?? " "}
                disabled={submitting}
              />

              <PasswordField
                label="Confirm new password"
                name="confirm-new-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (confirmError) {
                    setConfirmError(
                      validateConfirmPassword(
                        event.target.value,
                        newPassword,
                      ),
                    );
                  }
                  setError(null);
                }}
                onBlur={() =>
                  setConfirmError(
                    validateConfirmPassword(confirmPassword, newPassword),
                  )
                }
                error={Boolean(confirmError)}
                helperText={confirmError ?? " "}
                disabled={submitting}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting || !newPassword || !confirmPassword}
              >
                {submitting ? "Resetting…" : "Reset password"}
              </Button>
            </Stack>
          </Box>
        )}

        {step === 4 && (
          <Stack spacing={2.5}>
            <Alert severity="success">
              Your password has been reset. Please sign in with your new
              password.
            </Alert>
            <Button
              component={Link}
              href="/login"
              fullWidth
              variant="contained"
              size="large"
            >
              Back to Sign In
            </Button>
          </Stack>
        )}
      </Stack>
    </AuthCard>
  );
}
