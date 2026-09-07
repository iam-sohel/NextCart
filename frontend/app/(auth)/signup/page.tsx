"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
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
  validateConfirmPassword,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhone,
  validateTermsAccepted,
} from "@/components/auth/validation";

import useAuthStore from "@/store/authStore";

/**
 * NEXTCART — /signup
 *
 * Multi-step registration flow per backend contract:
 *   STEP 1: Account Details     → POST /api/v1/auth/register
 *                           ↓ (PendingRegistration created,
 *                            Email+Phone OTPs sent)
 *   STEP 2: Verify Email        → POST /api/v1/auth/email/verify-otp
 *   STEP 3: Verify Phone        → POST /api/v1/auth/phone/verify-otp
 *   STEP 4: Registration Complete → POST /api/v1/auth/register/complete
 *                           ↓ Redirect to /login
 *
 * The backend is the source of truth for all endpoint contracts.
 * This page never redirects to /login immediately after /register.
 */

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    verifyEmailOtp,
    verifyPhoneOtp,
    completeRegistration,
    sendEmailVerificationOtp,
    sendPhoneVerificationOtp,
    loading,
    error,
    clearError,
    // user, emailVerified, phoneVerified - unused in this component
    setEmailVerified,
    setPhoneVerified,
  } = useAuthStore();

  // Step state: 1=details, 2=verify-email, 3=verify-phone, 4=complete
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Step 1 error state
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  // Step 2 (email OTP) state
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);
  const [emailOtpTouched, setEmailOtpTouched] = useState(false);

  // Step 3 (phone OTP) state
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);

  // Step 4 state
  const [completeSuccess, setCompleteSuccess] = useState<boolean>(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    clearError();
  }, [clearError]);

  const markTouched = (key: string) =>
    setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  const stepMarkTouched = markTouched;

  const revalidate = (
    key:
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "password"
      | "confirm"
      | "terms",
    current?: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
      acceptedTerms: boolean;
    }>,
  ) => {
    const c = current ?? {};
    switch (key) {
      case "firstName":
        setFirstNameError(validateFirstName(c.firstName ?? firstName));
        return;
      case "lastName":
        setLastNameError(validateLastName(c.lastName ?? lastName));
        return;
      case "email":
        setEmailError(validateEmail(c.email ?? email));
        return;
      case "phone":
        setPhoneError(validatePhone(c.phone ?? phone));
        return;
      case "password":
        setPasswordError(validatePassword(c.password ?? password));
        // When the password changes, the confirm field may now mismatch.
        if ((c.confirmPassword ?? confirmPassword) !== (c.password ?? password)) {
          setConfirmError(
            validateConfirmPassword(
              c.confirmPassword ?? confirmPassword,
              c.password ?? password,
            ),
          );
        }
        return;
      case "confirm":
        setConfirmError(
          validateConfirmPassword(
            c.confirmPassword ?? confirmPassword,
            c.password ?? password,
          ),
        );
        return;
      case "terms":
        setTermsError(
          validateTermsAccepted(c.acceptedTerms ?? acceptedTerms),
        );
        return;
      default:
        return;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fnErr = validateFirstName(firstName);
    const lnErr = validateLastName(lastName);
    const emErr = validateEmail(email);
    const phErr = validatePhone(phone);
    const pwErr = validatePassword(password);
    const cpErr = validateConfirmPassword(confirmPassword, password);
    const tmErr = validateTermsAccepted(acceptedTerms);

    setFirstNameError(fnErr);
    setLastNameError(lnErr);
    setEmailError(emErr);
    setPhoneError(phErr);
    setPasswordError(pwErr);
    setConfirmError(cpErr);
    setTermsError(tmErr);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirm: true,
      terms: true,
    });

    if (fnErr || lnErr || emErr || phErr || pwErr || cpErr || tmErr) return;

    // Step 1: Submit registration details
    setStep(2);
    setTouched({});

    const result = await register(
      firstName.trim(),
      lastName.trim(),
      email.trim(),
      phone.trim(),
      password
    );

    if (!result.ok) {
      clearError();
      setStep(1);
      return;
    }

    // Registration initiated — PendingRegistration created, OTPs sent
    // Stay on step 2 (verify email) and begin email verification
    setEmailOtp("");
    setEmailOtpError(null);
    setEmailOtpTouched(false);
    setStep(2);
  };

  const handleEmailOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const otpErr = validateEmailOtp(emailOtp);
    setEmailOtpError(otpErr ?? null);
    stepMarkTouched("email-otp");

    if (otpErr) return;

    setTouched({ emailOtpTouched: true });
    setStep(3); // move to phone verification

    const result = await verifyEmailOtp(email, emailOtp);

    if (!result.ok) {
      setEmailOtpError(result.message ?? "Invalid verification code.");
      setStep(2); // stay on email verification
      return;
    }

    // Email verified — transition to phone verification
    setEmailVerified(true);
    setEmailOtp("");
    setStep(3);
  };

  const handlePhoneOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const otpErr = validatePhoneOtp(phoneOtp);
    setPhoneOtpError(otpErr ?? null);
    stepMarkTouched("phone-otp");

    if (otpErr) return;

    setTouched({ phone: true });
    const result = await verifyPhoneOtp(phone, phoneOtp);

    if (!result.ok) {
      setPhoneOtpError(result.message ?? "Invalid verification code.");
      setStep(3); // stay on phone verification
      return;
    }

    // Phone verified — complete registration
    setPhoneVerified(true);
    setStep(4);

    const completeResult = await completeRegistration(email, phone);

    if (!completeResult.ok) {
      setStep(3);
      return;
    }

    // Registration complete — show success and redirect
    setCompleteSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  // Helper: validate for email OTP (6-digit)
  const validateEmailOtp = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "OTP is required.";
    if (!/^\d{6}$/.test(trimmed)) return "Enter a 6-digit code.";
    return null;
  };

  // Helper: validate for phone OTP (6-digit)
  const validatePhoneOtp = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "OTP is required.";
    if (!/^\d{6}$/.test(trimmed)) return "Enter a 6-digit code.";
    return null;
  };

  // OTP input change handler with auto-focus
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (value.length > 0 && index < 5) {
      const nextInput = document.querySelector(
        `[data-otp-index="${index + 1}"]`,
      ) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const renderOtpInput = (
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    error: string | null,
    touched: boolean,
    stepIndex: "email" | "phone",
  ) => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
          {label}
        </Typography>
        <Box>
          {[...Array(6).keys()].map((i) => (
            <TextField
              key={i}
              size="small"
              variant="outlined"
              label={i + 1}
              type="number"
              inputMode="numeric"
              data-otp-index={i}
              value={value[i] || ""}
              onChange={(e) => {
                const newValue = value.substring(0, i) + e.target.value + value.substring(i + 1);
                if (newValue.length === 1 && i < 5) {
                  handleOtpChange(e as React.ChangeEvent<HTMLInputElement>, i);
                }
                if (stepIndex === "email") {
                  setEmailOtp(newValue);
                } else {
                  setPhoneOtp(newValue);
                }
              }}
              onBlur={() => stepMarkTouched(`otp-${stepIndex}`)}
              error={Boolean(touched && error)}
              fullWidth
              sx={{
                marginRight: 4,
                width: 40,
              }}
            />
          ))}
        </Box>
        {touched && error ? (
          <FormHelperText error sx={{ mt: 0.5, color: "error.main" }}>
            {error}
          </FormHelperText>
        ) : null}
      </Box>
    );
  };

  // Clear errors when step changes
  useEffect(() => {
    // No setState in effect - errors are cleared via form re-render
  }, [step]);

  if (step === 4 && completeSuccess) {
    return (
      <AuthCard
        title="Registration Complete"
        subtitle="Your account has been created successfully."
        footer={
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <MuiLink component={Link} href="/login" sx={{ fontWeight: 600 }}>
              Sign in
            </MuiLink>
          </Typography>
        }
      >
        <Box component="form" noValidate>
          <Stack spacing={3}>
            <Alert severity="success" variant="outlined" role="alert">
              ✓ Account created successfully
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Your email and mobile number have been verified.
            </Typography>
            <Button
              type="button"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.125,
                fontWeight: 700,
                fontSize: "0.9rem",
                borderRadius: 1,
              }}
              onClick={() => router.push("/login")}
            >
              Continue to Sign In
            </Button>
          </Stack>
        </Box>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join NextCart and start shopping smarter."
      footer={
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <MuiLink component={Link} href="/login" sx={{ fontWeight: 600 }}>
            Sign in
          </MuiLink>
        </Typography>
      }
    >
      <Box>
        <Stack spacing={2}>
          {error ? (
            <Alert severity="error" variant="outlined" role="alert">
              {error}
            </Alert>
          ) : null}

          {step === 1 && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                {error ? (
                  <Alert severity="error" variant="outlined" role="alert">
                    {error}
                  </Alert>
                ) : null}

                <Box sx={{ display: { xs: "100%", sm: "initial" }, mb: 2 }}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    placeholder="First"
                    autoComplete="given-name"
                    fullWidth
                    size="small"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (touched.firstName) revalidate("firstName", { firstName: e.target.value });
                      if (error) clearError();
                    }}
                    onBlur={() => {
                      markTouched("firstName");
                      revalidate("firstName");
                    }}
                    error={Boolean(firstNameError)}
                    helperText={touched.firstName ? firstNameError ?? " " : " "}
                  />

                  <TextField
                    name="lastName"
                    label="Last Name"
                    placeholder="Last"
                    autoComplete="family-name"
                    fullWidth
                    size="small"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (touched.lastName) revalidate("lastName", { lastName: e.target.value });
                      if (error) clearError();
                    }}
                    onBlur={() => {
                      markTouched("lastName");
                      revalidate("lastName");
                    }}
                    error={Boolean(lastNameError)}
                    helperText={touched.lastName ? lastNameError ?? " " : " "}
                  />
                </Box>

                <TextField
                  name="email"
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  fullWidth
                  size="small"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) revalidate("email", { email: e.target.value });
                    if (error) clearError();
                  }}
                  onBlur={() => {
                    markTouched("email");
                    revalidate("email");
                  }}
                  error={Boolean(emailError)}
                  helperText={touched.email ? emailError ?? " " : " "}
                />

                <TextField
                  name="phone"
                  label="Mobile Number"
                  placeholder="9876543210"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  fullWidth
                  size="small"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (touched.phone) revalidate("phone", { phone: e.target.value });
                    if (error) clearError();
                  }}
                  onBlur={() => {
                    markTouched("phone");
                    revalidate("phone");
                  }}
                  error={Boolean(phoneError)}
                  helperText={touched.phone ? phoneError ?? " " : " "}
                />

                <Box>
                  <PasswordField
                    name="password"
                    label="Password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password || touched.confirm)
                        revalidate("password", {
                          password: e.target.value,
                          confirmPassword,
                        });
                      if (error) clearError();
                    }}
                    onBlur={() => {
                      markTouched("password");
                      revalidate("password");
                    }}
                    error={Boolean(passwordError)}
                    helperText={touched.password ? passwordError ?? " " : " "}
                  />
                  <FormHelperText sx={{ ml: 0.25, mt: 0.5, color: "text.secondary" }}>
                    At least 8 characters, with upper and lower case, a number, and a
                    special character.
                  </FormHelperText>
                </Box>

                <PasswordField
                  name="confirmPassword"
                  label="Confirm Password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (touched.confirm)
                      revalidate("confirm", {
                        password,
                        confirmPassword: e.target.value,
                      });
                    if (error) clearError();
                  }}
                  onBlur={() => {
                    markTouched("confirm");
                    revalidate("confirm");
                  }}
                  error={Boolean(confirmError)}
                  helperText={touched.confirm ? confirmError ?? " " : " "}
                />

                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={acceptedTerms}
                        onChange={(e) => {
                          setAcceptedTerms(e.target.checked);
                          if (touched.terms)
                            revalidate("terms", { acceptedTerms: e.target.checked });
                        }}
                        onBlur={() => {
                          markTouched("terms");
                          revalidate("terms");
                        }}
                        slotProps={{
                          input: { "aria-label": "Agree to Terms and Conditions" },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        I agree to the{" "}
                        <MuiLink
                          component={Link}
                          href="/terms"
                          sx={{ fontWeight: 600 }}
                        >
                          Terms & Conditions
                        </MuiLink>
                      </Typography>
                    }
                  />
                  {touched.terms && termsError ? (
                    <FormHelperText error sx={{ ml: 3.25 }}>
                      {termsError}
                    </FormHelperText>
                  ) : null}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.125,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    borderRadius: 1,
                  }}
                >
                  {loading ? "Creating account…" : "Create Account"}
                </Button>

                <OrDivider />

                <SocialAuthButton />
              </Stack>
            </Box>
          )}

          {step === 2 && (
            <Box component="form" onSubmit={handleEmailOtpSubmit} noValidate>
              <Stack spacing={2}>
                <Typography variant="h6" component="h6">
                  Verify Your Email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We&apos;ve sent a 6-digit verification code to
                  <strong>{email}</strong>
                </Typography>

                {emailOtpTouched && emailOtpError ? (
                  <FormHelperText error>
                    {emailOtpError}
                  </FormHelperText>
                ) : null}

                <Box>
                  {renderOtpInput(
                    "Enter verification code",
                    emailOtp,
                    () => {}, // handled via data-otp-index
                    emailOtpError,
                    emailOtpTouched,
                    "email",
                  )}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="medium"
                  disabled={emailOtpTouched && emailOtp.length < 6}
                  sx={{
                    py: 1,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    borderRadius: 1,
                  }}
                >
                  Verify Email
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Did&apos;t receive the code?{" "}
                  <a href="javascript:void(0)" onClick={() => {
                    sendEmailVerificationOtp(email);
                  }}>
                    Resend OTP
                  </a>
                </Typography>
              </Stack>
            </Box>
          )}

          {step === 3 && (
            <Box component="form" onSubmit={handlePhoneOtpSubmit} noValidate>
              <Stack spacing={2}>
                <Typography variant="h6" component="h6">
                  Verify Your Mobile Number
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We&apos;ve sent a 6-digit code to
                  <strong>{phone.substring(phone.length - 4)}</strong>
                </Typography>

                {phoneOtpError ? (
                  <FormHelperText error>
                    {phoneOtpError}
                  </FormHelperText>
                ) : null}

                <Box>
                  {renderOtpInput(
                    "Enter verification code",
                    phoneOtp,
                    () => {}, // handled via data-otp-index
                    phoneOtpError,
                    phoneOtp.length > 0,
                    "phone",
                  )}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="medium"
                  disabled={phoneOtp.length < 6}
                  sx={{
                    py: 1,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    borderRadius: 1,
                  }}
                >
                  Verify Mobile
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Did&apos;t receive the code?{" "}
                  <a href="javascript:void(0)" onClick={() => {
                    sendPhoneVerificationOtp(phone);
                  }}>
                    Resend OTP
                  </a>
                </Typography>
              </Stack>
            </Box>
          )}

          {step === 4 && !completeSuccess && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Registration in progress...
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </AuthCard>
  );
}
