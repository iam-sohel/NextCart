"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link as MuiLink,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";

import AuthCard from "@/components/auth/AuthCard";
import PasswordField from "@/components/auth/PasswordField";

import {
  sellerAuthService,
  type SellerSignupDetails,
} from "@/services/sellerAuthService";

type SignupStep = 1 | 2 | 3 | 4;

interface Msg91WidgetConfiguration {
  widgetId: string;
  tokenAuth: string;
  identifier?: string;
  exposeMethods?: boolean;
  success: (data: unknown) => void;
  failure: (error: unknown) => void;
}

declare global {
  interface Window {
    initSendOTP?: (configuration: Msg91WidgetConfiguration) => void;
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_PHONE_PATTERN = /^[6-9]\d{9}$/;
const OTP_PATTERN = /^\d{6}$/;
const RESEND_COOLDOWN_MS = 60_000;

function requiredWithMaxLength(
  value: string,
  label: string,
  maxLength: number,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length > maxLength) {
    return `${label} must not exceed ${maxLength} characters.`;
  }
  return null;
}

function validateSellerPassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8 || value.length > 100) {
    return "Password must be between 8 and 100 characters.";
  }
  return null;
}

/**
 * MSG91 returns an access token after successful OTP verification.
 * Search conservatively without assuming the exact response shape.
 */
function extractMsg91AccessToken(data: unknown): string | null {
  const visited = new Set<unknown>();

  const findToken = (value: unknown, depth = 0): string | null => {
    if (depth > 4 || value == null) return null;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) {
        return trimmed;
      }
      return null;
    }

    if (typeof value !== "object") return null;
    if (visited.has(value)) return null;
    visited.add(value);

    const children = Array.isArray(value)
      ? value
      : Object.values(value as Record<string, unknown>);

    for (const child of children) {
      const token = findToken(child, depth + 1);
      if (token) return token;
    }

    return null;
  };

  return findToken(data);
}

function sellerAuthErrorMessage(
  result: { status: number; message: string },
  fallback: string,
): string {
  if (result.status === 0) {
    return "We couldn't connect to NextCart. Please check your connection and try again.";
  }

  const message = result.message.trim();
  if (message) {
    if (/maximum otp attempts/i.test(message)) {
      return "Maximum verification attempts reached. Request a new code.";
    }
    return message;
  }

  if (result.status === 400) return fallback;
  if (result.status === 401) return "Authentication is required for this step.";
  if (result.status === 403) {
    return "This request was rejected. It may require seller permissions.";
  }
  if (result.status === 404) return "The requested registration was not found.";
  if (result.status === 409) {
    return "This seller account appears to be registered already.";
  }
  if (result.status === 410) {
    return "Your verification session has expired. Please register again.";
  }
  return fallback;
}

export default function SellerSignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<SignupStep>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [submittedDetails, setSubmittedDetails] =
    useState<SellerSignupDetails | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(
    null,
  );
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [registering, setRegistering] = useState(false);
  const [requestingNewCode, setRequestingNewCode] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(
    null,
  );
  const [now, setNow] = useState(() => Date.now());

  const [widgetError, setWidgetError] = useState<string | null>(null);
  const widgetStartedRef = useRef(false);

  const busy =
    registering || requestingNewCode || verifyingEmail || verifyingPhone;
  const resendRemainingSeconds =
    resendAvailableAt === null
      ? 0
      : Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));

  useEffect(() => {
    if (step !== 2 || resendAvailableAt === null) return;
    if (resendAvailableAt <= Date.now()) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, resendAvailableAt]);

  const markTouched = (key: string) => {
    setTouched((current) => (current[key] ? current : { ...current, [key]: true }));
  };

  const validateDetails = (): Record<string, string | null> => {
    const nextErrors: Record<string, string | null> = {
      firstName: requiredWithMaxLength(firstName, "First name", 100),
      lastName: requiredWithMaxLength(lastName, "Last name", 100),
      businessName: requiredWithMaxLength(businessName, "Business name", 150),
      email: null,
      phone: null,
      password: validateSellerPassword(password),
      confirmPassword: null,
      gstNumber: null,
      terms: acceptedTerms ? null : "You must agree to the Terms & Conditions.",
    };

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    } else if (trimmedEmail.length > 150) {
      nextErrors.email = "Email must not exceed 150 characters.";
    }

    const digits = phone.replace(/\D/g, "");
    if (!digits) {
      nextErrors.phone = "Phone number is required.";
    } else if (!INDIAN_PHONE_PATTERN.test(digits)) {
      nextErrors.phone =
        "Enter a valid 10-digit Indian mobile number starting with 6-9.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (gstNumber.trim() && gstNumber.trim().length > 30) {
      nextErrors.gstNumber = "GST number must not exceed 30 characters.";
    }

    return nextErrors;
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    setFormError(null);
    const errors = validateDetails();
    setFieldErrors(errors);
    setTouched({
      firstName: true,
      lastName: true,
      businessName: true,
      gstNumber: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (Object.values(errors).some(Boolean)) return;

    const payload: SellerSignupDetails = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.replace(/\D/g, ""),
      password,
      businessName: businessName.trim(),
      gstNumber: gstNumber.trim() || undefined,
    };

    setRegistering(true);
    const result = await sellerAuthService.registerSeller(payload);
    setRegistering(false);

    if (!result.ok) {
      setFormError(
        sellerAuthErrorMessage(
          result,
          "We couldn't start seller registration. Please try again.",
        ),
      );
      return;
    }

    setSubmittedDetails(payload);
    setRegistrationMessage(result.data.message);
    setEmailOtpSent(result.data.emailOtpSent);
    setPhoneOtpSent(result.data.phoneOtpSent);
    setEmailVerified(false);
    setPhoneVerified(false);
    setCompleted(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    setWidgetError(null);
    widgetStartedRef.current = false;
    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
    setStep(2);
  };

  const requestNewEmailCode = async () => {
    if (busy || !submittedDetails || resendRemainingSeconds > 0) return;

    setFormError(null);
    setOtpError(null);
    setRequestingNewCode(true);

    const result = await sellerAuthService.registerSeller(submittedDetails);
    setRequestingNewCode(false);

    if (!result.ok) {
      setOtpError(
        sellerAuthErrorMessage(
          result,
          "We couldn't request a new verification code.",
        ),
      );
      return;
    }

    setRegistrationMessage(result.data.message);
    setEmailOtpSent(result.data.emailOtpSent);
    setPhoneOtpSent(result.data.phoneOtpSent);
    setEmailVerified(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
  };

  const setOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    setOtpError(null);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpBackspace = (
    event: React.KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (event.key !== "Backspace" || otpDigits[index] || index === 0) return;

    event.preventDefault();
    setOtpDigits((current) => {
      const next = [...current];
      next[index - 1] = "";
      return next;
    });
    otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    for (let index = 0; index < pasted.length; index += 1) {
      next[index] = pasted[index];
    }
    setOtpDigits(next);
    setOtpError(null);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !submittedDetails) return;

    const otp = otpDigits.join("");
    if (!OTP_PATTERN.test(otp)) {
      setOtpError("Enter the 6-digit verification code.");
      return;
    }

    setOtpError(null);
    setVerifyingEmail(true);
    const result = await sellerAuthService.verifySellerEmailOtp(
      submittedDetails.email,
      otp,
    );
    setVerifyingEmail(false);

    if (!result.ok) {
      setOtpError(
        sellerAuthErrorMessage(
          result,
          "The verification code is invalid or expired.",
        ),
      );
      return;
    }

    setEmailVerified(true);
    setStep(3);
  };

  const startPhoneVerification = useCallback(() => {
    if (widgetStartedRef.current || verifyingPhone || !submittedDetails) return;

    const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID?.trim();
    const tokenAuth = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH?.trim();

    if (!widgetId || !tokenAuth) {
      setWidgetError(
        "MSG91 configuration is missing. Check NEXT_PUBLIC_MSG91_WIDGET_ID and NEXT_PUBLIC_MSG91_TOKEN_AUTH.",
      );
      return;
    }

    if (typeof window.initSendOTP !== "function") {
      setWidgetError("MSG91 OTP widget could not be initialized.");
      return;
    }

    widgetStartedRef.current = true;
    setWidgetError(null);

    window.initSendOTP({
      widgetId,
      tokenAuth,
      identifier: `91${submittedDetails.phone}`,
      exposeMethods: false,
      success: (data: unknown) => {
        void (async () => {
          const accessToken = extractMsg91AccessToken(data);
          if (!accessToken || !submittedDetails) {
            setWidgetError(
              "MSG91 verification succeeded, but no access token was received.",
            );
            return;
          }

          setVerifyingPhone(true);
          const result = await sellerAuthService.verifySellerPhoneOtp(
            submittedDetails.phone,
            accessToken,
          );
          setVerifyingPhone(false);

          if (!result.ok) {
            setWidgetError(
              sellerAuthErrorMessage(
                result,
                "Phone verification failed. Please try again.",
              ),
            );
            return;
          }

          setPhoneVerified(true);
          setCompleted(true);
          setPassword("");
          setConfirmPassword("");
          setStep(4);
        })();
      },
      failure: () => {
        setVerifyingPhone(false);
        setWidgetError("MSG91 phone verification failed. Please try again.");
      },
    });
  }, [submittedDetails, verifyingPhone]);

  const retryPhoneVerification = () => {
    widgetStartedRef.current = false;
    setWidgetError(null);
    startPhoneVerification();
  };

  const goToSellerLogin = () => {
    if (!submittedDetails) return;
    router.push(
      `/seller/login?identifier=${encodeURIComponent(submittedDetails.email)}`,
    );
  };

  const activeStep = step === 4 ? 3 : step - 1;
  const emailLabel = submittedDetails?.email || "your email";
  const phoneLabel = submittedDetails?.phone
    ? `+91 ${submittedDetails.phone}`
    : "your phone number";

  return (
    <AuthCard
      title={
        step === 1
          ? "Become a NextCart seller"
          : step === 2
            ? "Verify your email"
            : step === 3
              ? "Verify your phone number"
              : "Seller account ready"
      }
      subtitle={
        step === 1
          ? "Register your business to start selling"
          : step === 2
            ? "Enter the email verification code"
            : step === 3
              ? "Complete phone verification with MSG91"
              : "Your seller verification is complete"
      }
      footer={
        step === 1 ? (
          <Typography variant="body2" color="text.secondary">
            Already have a seller account?{" "}
            <MuiLink component={Link} href="/seller/login" sx={{ fontWeight: 600 }}>
              Sign in
            </MuiLink>
          </Typography>
        ) : undefined
      }
    >
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1 }}>
        <Step completed={step > 1 || emailVerified}>
          <StepLabel>Business details</StepLabel>
        </Step>
        <Step completed={step > 2 || emailVerified}>
          <StepLabel>Email verification</StepLabel>
        </Step>
        <Step completed={step > 3 || phoneVerified}>
          <StepLabel>Phone verification</StepLabel>
        </Step>
      </Stepper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {step === 4 ? "Registration complete" : `Step ${Math.min(step, 3)} of 3`}
      </Typography>

      {formError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      ) : null}

      {step === 1 && (
        <Box component="form" onSubmit={handleRegister} noValidate>
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    if (touched.firstName) {
                      setFieldErrors((current) => ({
                        ...current,
                        firstName: requiredWithMaxLength(
                          event.target.value,
                          "First name",
                          100,
                        ),
                      }));
                    }
                  }}
                  onBlur={() => {
                    markTouched("firstName");
                    setFieldErrors((current) => ({
                      ...current,
                      firstName: requiredWithMaxLength(
                        firstName,
                        "First name",
                        100,
                      ),
                    }));
                  }}
                  error={Boolean(touched.firstName && fieldErrors.firstName)}
                  helperText={touched.firstName ? fieldErrors.firstName : ""}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last name"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    if (touched.lastName) {
                      setFieldErrors((current) => ({
                        ...current,
                        lastName: requiredWithMaxLength(
                          event.target.value,
                          "Last name",
                          100,
                        ),
                      }));
                    }
                  }}
                  onBlur={() => {
                    markTouched("lastName");
                    setFieldErrors((current) => ({
                      ...current,
                      lastName: requiredWithMaxLength(
                        lastName,
                        "Last name",
                        100,
                      ),
                    }));
                  }}
                  error={Boolean(touched.lastName && fieldErrors.lastName)}
                  helperText={touched.lastName ? fieldErrors.lastName : ""}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Business name"
                  autoComplete="organization"
                  value={businessName}
                  onChange={(event) => {
                    setBusinessName(event.target.value);
                    if (touched.businessName) {
                      setFieldErrors((current) => ({
                        ...current,
                        businessName: requiredWithMaxLength(
                          event.target.value,
                          "Business name",
                          150,
                        ),
                      }));
                    }
                  }}
                  onBlur={() => {
                    markTouched("businessName");
                    setFieldErrors((current) => ({
                      ...current,
                      businessName: requiredWithMaxLength(
                        businessName,
                        "Business name",
                        150,
                      ),
                    }));
                  }}
                  error={Boolean(touched.businessName && fieldErrors.businessName)}
                  helperText={touched.businessName ? fieldErrors.businessName : ""}
                  slotProps={{ htmlInput: { maxLength: 150 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="GST number (optional)"
                  value={gstNumber}
                  onChange={(event) => {
                    const next = event.target.value.toUpperCase();
                    setGstNumber(next);
                    if (touched.gstNumber) {
                      setFieldErrors((current) => ({
                        ...current,
                        gstNumber:
                          next.trim() && next.trim().length > 30
                            ? "GST number must not exceed 30 characters."
                            : null,
                      }));
                    }
                  }}
                  onBlur={() => {
                    markTouched("gstNumber");
                    setFieldErrors((current) => ({
                      ...current,
                      gstNumber:
                        gstNumber.trim() && gstNumber.trim().length > 30
                          ? "GST number must not exceed 30 characters."
                          : null,
                    }));
                  }}
                  error={Boolean(touched.gstNumber && fieldErrors.gstNumber)}
                  helperText={touched.gstNumber ? fieldErrors.gstNumber : ""}
                  slotProps={{ htmlInput: { maxLength: 30 } }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => markTouched("email")}
              error={Boolean(touched.email && fieldErrors.email)}
              helperText={touched.email ? fieldErrors.email : ""}
              slotProps={{ htmlInput: { maxLength: 150 } }}
            />

            <TextField
              fullWidth
              label="Mobile number"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
              }}
              onBlur={() => markTouched("phone")}
              error={Boolean(touched.phone && fieldErrors.phone)}
              helperText={
                touched.phone
                  ? fieldErrors.phone
                  : "10-digit Indian mobile number starting with 6-9."
              }
              slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
            />

            <PasswordField
              label="Password"
              name="seller-password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => markTouched("password")}
              error={Boolean(touched.password && fieldErrors.password)}
              helperText={
                touched.password
                  ? fieldErrors.password
                  : "8-100 characters."
              }
              disabled={registering}
            />

            <PasswordField
              label="Confirm password"
              name="seller-confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              onBlur={() => markTouched("confirmPassword")}
              error={Boolean(touched.confirmPassword && fieldErrors.confirmPassword)}
              helperText={touched.confirmPassword ? fieldErrors.confirmPassword : ""}
              disabled={registering}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  onBlur={() => markTouched("terms")}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the seller Terms & Conditions.
                </Typography>
              }
            />
            {touched.terms && fieldErrors.terms ? (
              <FormHelperText error>{fieldErrors.terms}</FormHelperText>
            ) : null}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={registering}
            >
              {registering ? "Starting registration…" : "Continue"}
            </Button>
          </Stack>
        </Box>
      )}

      {step === 2 && submittedDetails && (
        <Stack spacing={2.5}>
          {registrationMessage ? (
            <Alert severity="success">{registrationMessage}</Alert>
          ) : null}

          <Typography variant="body2" color="text.secondary">
            {emailOtpSent
              ? `We sent a verification code to ${emailLabel}.`
              : "Registration was accepted, but the response did not confirm that a code was sent."}
          </Typography>

          <Box component="form" onSubmit={handleVerifyEmail} noValidate>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Email verification code
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {otpDigits.map((digit, index) => (
                <TextField
                  key={`seller-email-otp-${index}`}
                  size="small"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus={index === 0}
                  aria-label={`Email verification digit ${index + 1} of 6`}
                  value={digit}
                  onChange={(event) => setOtpDigit(index, event.target.value)}
                  onKeyDown={(event) => handleOtpBackspace(event, index)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  error={Boolean(otpError)}
                  disabled={verifyingEmail}
                  slotProps={{ htmlInput: { maxLength: 1 } }}
                  sx={{ width: 48 }}
                  inputRef={(element) => {
                    otpRefs.current[index] = element;
                  }}
                />
              ))}
            </Box>

            {otpError ? (
              <FormHelperText error sx={{ mt: 1 }}>
                {otpError}
              </FormHelperText>
            ) : null}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={verifyingEmail}
              sx={{ mt: 2 }}
            >
              {verifyingEmail ? "Verifying…" : "Verify Email"}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Button
              type="button"
              variant="text"
              disabled={
                requestingNewCode ||
                verifyingEmail ||
                resendRemainingSeconds > 0
              }
              onClick={() => void requestNewEmailCode()}
            >
              {requestingNewCode
                ? "Requesting…"
                : resendRemainingSeconds > 0
                  ? `Request a new code in ${resendRemainingSeconds}s`
                  : "Request a new code"}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              A new request restarts the 15-minute verification session.
            </Typography>
          </Box>
        </Stack>
      )}

      {step === 3 && submittedDetails && (
        <Stack spacing={2}>
          <Script
            id="seller-msg91-otp-widget-script"
            src="https://verify.msg91.com/otp-provider.js"
            strategy="afterInteractive"
            onLoad={() => startPhoneVerification()}
            onError={() =>
              setWidgetError(
                "Unable to load the MSG91 OTP widget. Please check your internet connection and MSG91 configuration.",
              )
            }
          />

          <Typography variant="body2" color="text.secondary">
            Verify {phoneLabel} with MSG91.{" "}
            {emailVerified ? "Email verification is complete." : ""}
          </Typography>

          {phoneOtpSent ? null : (
            <Alert severity="info">
              The registration response did not confirm MSG91 phone OTP
              delivery. If the widget does not start, check the configured
              widget credentials.
            </Alert>
          )}

          {widgetError ? (
            <Alert
              severity="error"
              onClose={() => setWidgetError(null)}
            >
              {widgetError}
            </Alert>
          ) : null}

          {verifyingPhone && !widgetError ? (
            <Alert severity="info">
              MSG91 verification succeeded. Confirming it with NextCart…
            </Alert>
          ) : null}

          <Button
            type="button"
            variant="contained"
            fullWidth
            size="large"
            disabled={verifyingPhone}
            onClick={retryPhoneVerification}
          >
            {verifyingPhone
              ? "Confirming…"
              : widgetError
                ? "Retry phone verification"
                : "Start phone verification"}
          </Button>

          <Button
            type="button"
            variant="text"
            disabled={verifyingPhone}
            onClick={() => {
              setStep(2);
              setOtpError(null);
            }}
          >
            Back to email verification
          </Button>
        </Stack>
      )}

      {step === 4 && completed && submittedDetails && (
        <Stack spacing={2.5} sx={{ textAlign: "center" }}>
          <Alert severity="success">
            Seller account created successfully. Your NextCart seller account
            is ready.
          </Alert>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={goToSellerLogin}
          >
            Continue to Seller Login
          </Button>
        </Stack>
      )}
    </AuthCard>
  );
}
