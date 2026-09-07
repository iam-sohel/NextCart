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
  } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);
  const [emailOtpTouched, setEmailOtpTouched] = useState(false);

  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);

  const [completeSuccess, setCompleteSuccess] = useState<boolean>(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    clearError();
  }, [clearError]);

  const markTouched = (key: string) =>
    setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  const stepMarkTouched = markTouched;

  const revalidate = (
    field:
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "password"
      | "confirmPassword"
      | "terms",
    value: string | boolean,
  ) => {
    switch (field) {
      case "firstName":
        setFirstNameError(validateFirstName(value as string));
        break;
      case "lastName":
        setLastNameError(validateLastName(value as string));
        break;
      case "email":
        setEmailError(validateEmail(value as string));
        break;
      case "phone":
        setPhoneError(validatePhone(value as string));
        break;
      case "password":
        setPasswordError(validatePassword(value as string));
        break;
      case "confirmPassword":
        setConfirmError(
          validateConfirmPassword(password, value as string),
        );
        break;
      case "terms":
        setTermsError(validateTermsAccepted(value as boolean));
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    clearError();

    const firstErr = validateFirstName(firstName);
    const lastErr = validateLastName(lastName);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    const termsErr = validateTermsAccepted(acceptedTerms);

    setFirstNameError(firstErr);
    setLastNameError(lastErr);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    setPasswordError(passwordErr);
    setConfirmError(confirmErr);
    setTermsError(termsErr);

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (
      firstErr ||
      lastErr ||
      emailErr ||
      phoneErr ||
      passwordErr ||
      confirmErr ||
      termsErr
    ) {
      return;
    }

    setStep(2);
    setTouched({});

    const result = await register(
      firstName,
      lastName,
      email,
      phone,
      password,
    );

    if (!result.ok) {
      clearError();
      setStep(1);
      return;
    }

    setEmailOtp("");
    setEmailOtpError(null);
    setEmailOtpTouched(false);
    setStep(2);
  };

  const handleEmailOtpSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    clearError();

    const validationError = validateEmailOtp(emailOtp);

    if (validationError) {
      setEmailOtpError(validationError);
      setEmailOtpTouched(true);
      return;
    }

    const result = await verifyEmailOtp(email, emailOtp);

    if (!result.ok) {
      setEmailOtpError(
        result.message ?? "Invalid verification code.",
      );
      setEmailOtpTouched(true);
      setStep(2);
      return;
    }

    setEmailOtp("");
    setEmailOtpError(null);
    setEmailOtpTouched(false);
    setStep(3);
  };

  const handlePhoneOtpSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    clearError();

    const validationError = validatePhoneOtp(phoneOtp);

    if (validationError) {
      setPhoneOtpError(validationError);
      return;
    }

    const result = await verifyPhoneOtp(phone, phoneOtp);

    if (!result.ok) {
      setPhoneOtpError(
        result.message ?? "Invalid verification code.",
      );
      setStep(3);
      return;
    }

    const completeResult = await completeRegistration(email, phone);

    if (!completeResult.ok) {
      setStep(3);
      return;
    }

    setStep(4);
    setCompleteSuccess(true);

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  const validateEmailOtp = (value: string): string | null => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "OTP is required.";
    }

    if (!/^\d{6}$/.test(trimmed)) {
      return "Enter a 6-digit code.";
    }

    return null;
  };

  const validatePhoneOtp = (value: string): string | null => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "OTP is required.";
    }

    if (!/^\d{6}$/.test(trimmed)) {
      return "Enter a 6-digit code.";
    }

    return null;
  };

  /**
   * Handles a single OTP box.
   *
   * Each box represents one digit. The value is stored as
   * one six-character string in Zustand/page state.
   */
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    currentValue: string,
    setOtp: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const inputValue = e.target.value.replace(/\D/g, "");

    // Keep only the latest entered digit.
    const digit = inputValue.slice(-1);

    const nextValue =
      currentValue.substring(0, index) +
      digit +
      currentValue.substring(index + 1);

    setOtp(nextValue);

    // Automatically move to the next OTP box.
    if (digit && index < 5) {
      const nextInput = document.querySelector(
        `[data-otp-index="${index + 1}"]`,
      ) as HTMLInputElement | null;

      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  /**
   * Reusable six-digit OTP input.
   */
  const renderOtpInput = (
    label: string,
    value: string,
    setOtp: React.Dispatch<React.SetStateAction<string>>,
    error: string | null,
    touched: boolean,
    stepIndex: "email" | "phone",
  ) => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ mb: 1 }}
        >
          {label}
        </Typography>

        <Box>
          {[...Array(6).keys()].map((i) => (
            <TextField
              key={i}
              size="small"
              variant="outlined"
              label={i + 1}
              type="text"
              inputMode="numeric"
              data-otp-index={i}
              value={value[i] || ""}
              onChange={(e) => {
                handleOtpChange(
                  e as React.ChangeEvent<HTMLInputElement>,
                  i,
                  value,
                  setOtp,
                );
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" &&
                  !value[i] &&
                  i > 0
                ) {
                  const previousInput = document.querySelector(
                    `[data-otp-index="${i - 1}"]`,
                  ) as HTMLInputElement | null;

                  if (previousInput) {
                    previousInput.focus();
                  }

                  const nextValue =
                    value.substring(0, i - 1) +
                    value.substring(i);

                  setOtp(nextValue);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();

                const pastedValue = e.clipboardData
                  .getData("text")
                  .replace(/\D/g, "")
                  .slice(0, 6);

                if (!pastedValue) {
                  return;
                }

                setOtp(pastedValue);

                const focusIndex = Math.min(
                  pastedValue.length,
                  5,
                );

                const targetInput = document.querySelector(
                  `[data-otp-index="${focusIndex}"]`,
                ) as HTMLInputElement | null;

                if (targetInput) {
                  targetInput.focus();
                }
              }}
              onBlur={() =>
                stepMarkTouched(`otp-${stepIndex}`)
              }
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
          <FormHelperText
            error
            sx={{ mt: 0.5, color: "error.main" }}
          >
            {error}
          </FormHelperText>
        ) : null}
      </Box>
    );
  };

  return (
    <AuthCard
      title={
        step === 1
          ? "Create your account"
          : step === 2
            ? "Verify Your Email"
            : step === 3
              ? "Verify Your Phone"
              : "Account Created"
      }
      subtitle={
        step === 1
          ? "Create an account to get started"
          : step === 2
            ? "Enter the verification code sent to your email"
            : step === 3
              ? "Enter the verification code sent to your phone"
              : "Your account has been created successfully"
      }
    >
      {error ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      ) : null}

      {step === 1 && (
        <>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (touched.firstName) {
                    revalidate("firstName", e.target.value);
                  }
                }}
                onBlur={() => {
                  markTouched("firstName");
                  revalidate("firstName", firstName);
                }}
                error={Boolean(
                  touched.firstName && firstNameError,
                )}
                helperText={
                  touched.firstName ? firstNameError : ""
                }
                fullWidth
              />

              <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (touched.lastName) {
                    revalidate("lastName", e.target.value);
                  }
                }}
                onBlur={() => {
                  markTouched("lastName");
                  revalidate("lastName", lastName);
                }}
                error={Boolean(
                  touched.lastName && lastNameError,
                )}
                helperText={
                  touched.lastName ? lastNameError : ""
                }
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) {
                    revalidate("email", e.target.value);
                  }
                }}
                onBlur={() => {
                  markTouched("email");
                  revalidate("email", email);
                }}
                error={Boolean(
                  touched.email && emailError,
                )}
                helperText={
                  touched.email ? emailError : ""
                }
                fullWidth
              />

              <TextField
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (touched.phone) {
                    revalidate("phone", e.target.value);
                  }
                }}
                onBlur={() => {
                  markTouched("phone");
                  revalidate("phone", phone);
                }}
                error={Boolean(
                  touched.phone && phoneError,
                )}
                helperText={
                  touched.phone ? phoneError : ""
                }
                fullWidth
              />

              <PasswordField
                label="Password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  if (touched.password) {
                    revalidate("password", e.target.value);
                  }

                  if (touched.confirmPassword) {
                    revalidate(
                      "confirmPassword",
                      confirmPassword,
                    );
                  }
                }}
                onBlur={() => {
                  markTouched("password");
                  revalidate("password", password);
                }}
                error={
                  Boolean(
                    touched.password && passwordError,
                  )
                }
                helperText={
                  touched.password ? passwordError : ""
                }
              />

              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);

                  if (touched.confirmPassword) {
                    revalidate(
                      "confirmPassword",
                      e.target.value,
                    );
                  }
                }}
                onBlur={() => {
                  markTouched("confirmPassword");
                  revalidate(
                    "confirmPassword",
                    confirmPassword,
                  );
                }}
                error={
                  Boolean(
                    touched.confirmPassword && confirmError,
                  )
                }
                helperText={
                  touched.confirmPassword
                    ? confirmError
                    : ""
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);

                      if (touched.terms) {
                        revalidate(
                          "terms",
                          e.target.checked,
                        );
                      }
                    }}
                    onBlur={() => {
                      markTouched("terms");
                      revalidate(
                        "terms",
                        acceptedTerms,
                      );
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the terms and conditions
                  </Typography>
                }
              />

              {touched.terms && termsError ? (
                <FormHelperText error>
                  {termsError}
                </FormHelperText>
              ) : null}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </Stack>
          </Box>

          <OrDivider />

          <Stack spacing={1.5}>
            <SocialAuthButton />
            <SocialAuthButton />
          </Stack>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Already have an account?{" "}
              <MuiLink component={Link} href="/login">
                Login
              </MuiLink>
            </Typography>
          </Box>
        </>
      )}

      {step === 2 && (
        <Box component="form" onSubmit={handleEmailOtpSubmit}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            We sent a verification code to {email}
          </Typography>

          {renderOtpInput(
            "Enter verification code",
            emailOtp,
            setEmailOtp,
            emailOtpError,
            emailOtpTouched,
            "email",
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <MuiLink
              component="button"
              type="button"
              onClick={async () => {
                clearError();
                setEmailOtpError(null);
                setEmailOtpTouched(false);
                await sendEmailVerificationOtp(email);
              }}
              sx={{
                border: 0,
                background: "none",
                cursor: "pointer",
              }}
            >
              Resend OTP
            </MuiLink>
          </Box>
        </Box>
      )}

      {step === 3 && (
        <Box component="form" onSubmit={handlePhoneOtpSubmit}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            We sent a verification code to {phone}
          </Typography>

          {renderOtpInput(
            "Enter verification code",
            phoneOtp,
            setPhoneOtp,
            phoneOtpError,
            phoneOtp.length > 0,
            "phone",
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Phone"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <MuiLink
              component="button"
              type="button"
              onClick={async () => {
                clearError();
                setPhoneOtpError(null);
                await sendPhoneVerificationOtp(phone);
              }}
              sx={{
                border: 0,
                background: "none",
                cursor: "pointer",
              }}
            >
              Resend OTP
            </MuiLink>
          </Box>
        </Box>
      )}

      {step === 4 && (
        <Box sx={{ textAlign: "center" }}>
          {completeSuccess ? (
            <Alert severity="success">
              Your account has been created successfully.
              Redirecting you to login...
            </Alert>
          ) : null}
        </Box>
      )}
    </AuthCard>
  );
}