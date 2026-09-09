"use client";

import { useEffect, useState } from "react";
import type {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
} from "react";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
    initSendOTP?: (
        configuration: Msg91WidgetConfiguration,
    ) => void;
  }
}

/**
 * MSG91 returns an access token after successful OTP verification.
 * The exact response property is not assumed here.
 */
const extractMsg91AccessToken = (
    data: unknown,
): string | null => {
  const visited = new Set<unknown>();

  const findToken = (
      value: unknown,
      depth = 0,
  ): string | null => {
    if (depth > 4 || value == null) {
      return null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      // JWT format
      if (
          /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
              trimmed,
          )
      ) {
        return trimmed;
      }

      return null;
    }

    if (typeof value !== "object") {
      return null;
    }

    if (visited.has(value)) {
      return null;
    }

    visited.add(value);

    if (Array.isArray(value)) {
      for (const item of value) {
        const token = findToken(
            item,
            depth + 1,
        );

        if (token) {
          return token;
        }
      }

      return null;
    }

    const objectValue =
        value as Record<string, unknown>;

    for (const child of Object.values(
        objectValue,
    )) {
      const token = findToken(
          child,
          depth + 1,
      );

      if (token) {
        return token;
      }
    }

    return null;
  };

  return findToken(data);
};

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    verifyEmailOtp,
    verifyPhoneOtp,
    completeRegistration,
    sendEmailVerificationOtp,
    loading,
    error,
    clearError,
  } = useAuthStore();

  const [step, setStep] = useState<
      1 | 2 | 3 | 4
  >(1);

  const [firstName, setFirstName] =
      useState("");

  const [lastName, setLastName] =
      useState("");

  type SignupMethod = "email" | "phone";

  const [signupMethod, setSignupMethod] =
      useState<SignupMethod>("email");

  const [email, setEmail] =
      useState("");

  const [phone, setPhone] =
      useState("");

  const [password, setPassword] =
      useState("");

  const [confirmPassword, setConfirmPassword] =
      useState("");

  const [acceptedTerms, setAcceptedTerms] =
      useState(false);

  const [firstNameError, setFirstNameError] =
      useState<string | null>(null);

  const [lastNameError, setLastNameError] =
      useState<string | null>(null);

  const [emailError, setEmailError] =
      useState<string | null>(null);

  const [phoneError, setPhoneError] =
      useState<string | null>(null);

  const [passwordError, setPasswordError] =
      useState<string | null>(null);

  const [confirmError, setConfirmError] =
      useState<string | null>(null);

  const [termsError, setTermsError] =
      useState<string | null>(null);

  const [identifierError, setIdentifierError] =
      useState<string | null>(null);

  const [emailOtp, setEmailOtp] =
      useState("");

  const [emailOtpError, setEmailOtpError] =
      useState<string | null>(null);

  const [emailOtpTouched, setEmailOtpTouched] =
      useState(false);

  const [
    completeSuccess,
    setCompleteSuccess,
  ] = useState(false);

  const [
    phoneWidgetError,
    setPhoneWidgetError,
  ] = useState<string | null>(null);

  const [touched, setTouched] =
      useState<Record<string, boolean>>({});

  useEffect(() => {
    clearError();
  }, [clearError]);

  /*
   * ============================================================
   * MSG91 PHONE WIDGET
   * ============================================================
   *
   * Next.js <Script> handles loading the MSG91 SDK.
   * When the SDK is loaded, initializeMsg91Widget() starts
   * the default MSG91 OTP UI.
   */
  const initializeMsg91Widget = () => {
    const widgetId =
        process.env.NEXT_PUBLIC_MSG91_WIDGET_ID?.trim();

    const tokenAuth =
        process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH?.trim();

    console.log("MSG91 WIDGET ID:", widgetId);
    console.log(
        "MSG91 TOKEN EXISTS:",
        Boolean(tokenAuth),
    );
    console.log(
        "MSG91 INIT FUNCTION:",
        typeof window.initSendOTP,
    );

    if (!widgetId || !tokenAuth) {
      setPhoneWidgetError(
          "MSG91 configuration is missing. Check NEXT_PUBLIC_MSG91_WIDGET_ID and NEXT_PUBLIC_MSG91_TOKEN_AUTH.",
      );
      return;
    }

    if (typeof window.initSendOTP !== "function") {
      setPhoneWidgetError(
          "MSG91 OTP widget could not be initialized.",
      );
      return;
    }

    const configuration: Msg91WidgetConfiguration = {
      widgetId,
      tokenAuth,
      identifier: `91${phone.replace(/\D/g, "")}`,
      exposeMethods: false,

      success: async (data: unknown) => {
        console.log("MSG91 success response:", data);

        const accessToken =
            extractMsg91AccessToken(data);

        if (!accessToken) {
          setPhoneWidgetError(
              "MSG91 verification succeeded, but access token was not received.",
          );
          return;
        }

        const verifyResult =
            await verifyPhoneOtp(
                phone.trim(),
                accessToken,
            );

        if (!verifyResult.ok) {
          return;
        }

        const completeResult =
            await completeRegistration(
                undefined,
                phone.trim(),
            );

        if (!completeResult.ok) {
          return;
        }

        setStep(4);
        setCompleteSuccess(true);

        window.setTimeout(() => {
          router.push(
              `/login?registered=1&method=phone&identifier=${encodeURIComponent(
                  phone.trim(),
              )}`,
          );
        }, 3000);
      },

      failure: (widgetError: unknown) => {
        console.error(
            "MSG91 failure:",
            widgetError,
        );

        setPhoneWidgetError(
            typeof widgetError === "string"
                ? widgetError
                : "MSG91 phone verification failed.",
        );
      },
    };

    console.log("Initializing MSG91 widget...");

    window.initSendOTP(configuration);
  };

  /*
   * ============================================================
   * TOUCH / VALIDATION
   * ============================================================
   */

  const markTouched = (key: string) => {
    setTouched((current) =>
        current[key]
            ? current
            : {
              ...current,
              [key]: true,
            },
    );
  };

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
        setFirstNameError(
            validateFirstName(
                value as string,
            ),
        );
        break;

      case "lastName":
        setLastNameError(
            validateLastName(
                value as string,
            ),
        );
        break;

      case "email":
        setEmailError(
            value
                ? validateEmail(
                    value as string,
                )
                : null,
        );
        break;

      case "phone":
        setPhoneError(
            value
                ? validatePhone(
                    value as string,
                )
                : null,
        );
        break;

      case "password":
        setPasswordError(
            validatePassword(
                value as string,
            ),
        );
        break;

      case "confirmPassword":
        setConfirmError(
            validateConfirmPassword(
                value as string,
                password,
            ),
        );
        break;

      case "terms":
        setTermsError(
            validateTermsAccepted(
                value as boolean,
            ),
        );
        break;
    }
  };

  /*
   * ============================================================
   * REGISTER
   * ============================================================
   */

  const handleSubmit = async (
      e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    clearError();

    const hasEmail =
        signupMethod === "email";

    const hasPhone =
        signupMethod === "phone";

    const firstErr =
        validateFirstName(firstName);

    const lastErr =
        validateLastName(lastName);

    /*
     * Email and phone are individually
     * optional.
     *
     * Exactly one is required.
     */
    const emailErr = hasEmail
        ? validateEmail(email)
        : null;

    const phoneErr = hasPhone
        ? validatePhone(phone)
        : null;

    const passwordErr =
        validatePassword(password);

    const confirmErr =
        validateConfirmPassword(
            confirmPassword,
            password,
        );

    const termsErr =
        validateTermsAccepted(
            acceptedTerms,
        );

    let identifierErr: string | null = null;

    setFirstNameError(firstErr);
    setLastNameError(lastErr);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    setPasswordError(passwordErr);
    setConfirmError(confirmErr);
    setTermsError(termsErr);
    setIdentifierError(identifierErr);

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
        termsErr ||
        identifierErr
    ) {
      return;
    }

    const result = await register(
        firstName.trim(),
        lastName.trim(),
        hasEmail
            ? email.trim()
            : "",
        hasPhone
            ? phone.trim()
            : "",
        password,
    );

    if (!result.ok) {
      return;
    }

    /*
     * EMAIL REGISTRATION
     */
    if (hasEmail) {
      setEmailOtp("");
      setEmailOtpError(null);
      setEmailOtpTouched(false);
      setStep(2);
      return;
    }

    /*
     * PHONE REGISTRATION
     *
     * MSG91 widget starts when step becomes 3.
     */
    setPhoneWidgetError(null);
    setStep(3);
  };

  /*
   * ============================================================
   * EMAIL OTP
   * ============================================================
   */

  const validateEmailOtp = (
      value: string,
  ): string | null => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "OTP is required.";
    }

    if (!/^\d{6}$/.test(trimmed)) {
      return "Enter a 6-digit code.";
    }

    return null;
  };

  const handleEmailOtpSubmit = async (
      e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    clearError();

    const validationError =
        validateEmailOtp(emailOtp);

    if (validationError) {
      setEmailOtpError(
          validationError,
      );
      setEmailOtpTouched(true);
      return;
    }

    const result =
        await verifyEmailOtp(
            email,
            emailOtp,
        );

    if (!result.ok) {
      setEmailOtpError(
          result.message ??
          "Invalid verification code.",
      );

      setEmailOtpTouched(true);
      setStep(2);
      return;
    }

    /*
     * Email has now been verified.
     * Complete registration.
     */
    const completeResult =
        await completeRegistration(
            email.trim(),
            undefined,
        );

    if (!completeResult.ok) {
      setStep(2);
      return;
    }

    setEmailOtp("");
    setEmailOtpError(null);
    setEmailOtpTouched(false);

    setStep(4);
    setCompleteSuccess(true);

    window.setTimeout(() => {
      router.push(
          `/login?registered=1&method=email&identifier=${encodeURIComponent(
              email.trim(),
          )}`,
      );
    }, 3000);
  };

  /*
   * ============================================================
   * OTP INPUT
   * ============================================================
   */

  const handleOtpChange = (
      e: ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement
      >,
      index: number,
      currentValue: string,
      setOtp: Dispatch<
          SetStateAction<string>
      >,
  ) => {
    const inputValue =
        e.target.value.replace(
            /\D/g,
            "",
        );

    const digit =
        inputValue.slice(-1);

    const nextValue =
        currentValue.substring(
            0,
            index,
        ) +
        digit +
        currentValue.substring(
            index + 1,
        );

    setOtp(nextValue);

    if (
        digit &&
        index < 5
    ) {
      const nextInput =
          document.querySelector(
              `[data-otp-index="${index + 1}"]`,
          ) as HTMLInputElement | null;

      nextInput?.focus();
    }
  };

  const renderOtpInput = (
      label: string,
      value: string,
      setOtp: Dispatch<
          SetStateAction<string>
      >,
      otpError: string | null,
      otpTouched: boolean,
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

          <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
          >
            {[
              ...Array(6).keys(),
            ].map((i) => (
                <TextField
                    key={i}
                    size="small"
                    variant="outlined"
                    type="text"
                    inputMode="numeric"
                    data-otp-index={i}
                    value={value[i] || ""}
                    onChange={(e) => {
                      handleOtpChange(
                          e,
                          i,
                          value,
                          setOtp,
                      );
                    }}
                    onKeyDown={(e) => {
                      if (
                          e.key ===
                          "Backspace" &&
                          !value[i] &&
                          i > 0
                      ) {
                        const previousInput =
                            document.querySelector(
                                `[data-otp-index="${i - 1}"]`,
                            ) as HTMLInputElement | null;

                        previousInput?.focus();

                        const nextValue =
                            value.substring(
                                0,
                                i - 1,
                            ) +
                            value.substring(i);

                        setOtp(nextValue);
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();

                      const pastedValue =
                          e.clipboardData
                              .getData("text")
                              .replace(
                                  /\D/g,
                                  "",
                              )
                              .slice(0, 6);

                      if (!pastedValue) {
                        return;
                      }

                      setOtp(pastedValue);

                      const focusIndex =
                          Math.min(
                              pastedValue.length,
                              5,
                          );

                      const targetInput =
                          document.querySelector(
                              `[data-otp-index="${focusIndex}"]`,
                          ) as HTMLInputElement | null;

                      targetInput?.focus();
                    }}
                    error={Boolean(
                        otpTouched &&
                        otpError,
                    )}
                    sx={{
                      width: 48,
                    }}
                />
            ))}
          </Box>

          {otpTouched &&
          otpError ? (
              <FormHelperText
                  error
                  sx={{
                    mt: 0.5,
                    color: "error.main",
                  }}
              >
                {otpError}
              </FormHelperText>
          ) : null}
        </Box>
    );
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

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
                        ? "Complete phone verification using OTP"
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

        {/* ======================================================
          STEP 1 — REGISTRATION
         ====================================================== */}
        {step === 1 && (
            <>
              <Box
                  component="form"
                  onSubmit={handleSubmit}
              >
                <Stack spacing={2}>
                  <TextField
                      label="First Name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(
                            e.target.value,
                        );

                        if (
                            touched.firstName
                        ) {
                          revalidate(
                              "firstName",
                              e.target.value,
                          );
                        }
                      }}
                      onBlur={() => {
                        markTouched(
                            "firstName",
                        );

                        revalidate(
                            "firstName",
                            firstName,
                        );
                      }}
                      error={Boolean(
                          touched.firstName &&
                          firstNameError,
                      )}
                      helperText={
                        touched.firstName
                            ? firstNameError
                            : ""
                      }
                      fullWidth
                  />

                  <TextField
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(
                            e.target.value,
                        );

                        if (
                            touched.lastName
                        ) {
                          revalidate(
                              "lastName",
                              e.target.value,
                          );
                        }
                      }}
                      onBlur={() => {
                        markTouched(
                            "lastName",
                        );

                        revalidate(
                            "lastName",
                            lastName,
                        );
                      }}
                      error={Boolean(
                          touched.lastName &&
                          lastNameError,
                      )}
                      helperText={
                        touched.lastName
                            ? lastNameError
                            : ""
                      }
                      fullWidth
                  />

                  <FormControl fullWidth>
                    <InputLabel id="signup-method-label">Signup with</InputLabel>
                    <Select
                        labelId="signup-method-label"
                        value={signupMethod}
                        label="Signup with"
                        onChange={(e) => {
                          const method = e.target.value as SignupMethod;
                          setSignupMethod(method);
                          setIdentifierError(null);
                          setEmailError(null);
                          setPhoneError(null);
                        }}
                    >
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="phone">Number</MenuItem>
                    </Select>
                  </FormControl>

                  {signupMethod === "email" ? (
                      <TextField
                          label="Email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setIdentifierError(null);
                            if (touched.email) revalidate("email", e.target.value);
                          }}
                          onBlur={() => {
                            markTouched("email");
                            revalidate("email", email);
                          }}
                          error={Boolean(touched.email && emailError)}
                          helperText={touched.email ? emailError : ""}
                          fullWidth
                      />
                  ) : (
                      <TextField
                          label="Phone Number"
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setPhone(value);
                            setIdentifierError(null);
                            if (touched.phone) revalidate("phone", value);
                          }}
                          onBlur={() => {
                            markTouched("phone");
                            revalidate("phone", phone);
                          }}
                          error={Boolean(touched.phone && phoneError)}
                          helperText={touched.phone ? phoneError : ""}
                          fullWidth
                          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
                      />
                  )}
                  <PasswordField
                      label="Password"
                      name="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(
                            e.target.value,
                        );

                        if (
                            touched.password
                        ) {
                          revalidate(
                              "password",
                              e.target.value,
                          );
                        }

                        if (
                            touched.confirmPassword
                        ) {
                          setConfirmError(
                              validateConfirmPassword(
                                  e.target.value,
                                  confirmPassword,
                              ),
                          );
                        }
                      }}
                      onBlur={() => {
                        markTouched(
                            "password",
                        );

                        revalidate(
                            "password",
                            password,
                        );
                      }}
                      error={Boolean(
                          touched.password &&
                          passwordError,
                      )}
                      helperText={
                        touched.password
                            ? passwordError
                            : ""
                      }
                  />

                  <PasswordField
                      label="Confirm Password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(
                            e.target.value,
                        );

                        if (
                            touched.confirmPassword
                        ) {
                          revalidate(
                              "confirmPassword",
                              e.target.value,
                          );
                        }
                      }}
                      onBlur={() => {
                        markTouched(
                            "confirmPassword",
                        );

                        revalidate(
                            "confirmPassword",
                            confirmPassword,
                        );
                      }}
                      error={Boolean(
                          touched.confirmPassword &&
                          confirmError,
                      )}
                      helperText={
                        touched.confirmPassword
                            ? confirmError
                            : ""
                      }
                  />

                  <FormControlLabel
                      control={
                        <Checkbox
                            checked={
                              acceptedTerms
                            }
                            onChange={(e) => {
                              setAcceptedTerms(
                                  e.target.checked,
                              );

                              if (
                                  touched.terms
                              ) {
                                revalidate(
                                    "terms",
                                    e.target
                                        .checked,
                                );
                              }
                            }}
                            onBlur={() => {
                              markTouched(
                                  "terms",
                              );

                              revalidate(
                                  "terms",
                                  acceptedTerms,
                              );
                            }}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the
                          terms and
                          conditions
                        </Typography>
                      }
                  />

                  {touched.terms &&
                  termsError ? (
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
                    {loading
                        ? "Creating account..."
                        : "Create Account"}
                  </Button>
                </Stack>
              </Box>

              <OrDivider />

              <Stack spacing={1.5}>
                <SocialAuthButton />
                <SocialAuthButton />
              </Stack>

              <Box
                  sx={{
                    mt: 2,
                    textAlign: "center",
                  }}
              >
                <Typography variant="body2">
                  Already have an account?{" "}
                  <MuiLink
                      component={Link}
                      href="/login"
                  >
                    Login
                  </MuiLink>
                </Typography>
              </Box>
            </>
        )}

        {/* ======================================================
          STEP 2 — EMAIL OTP
         ====================================================== */}
        {step === 2 && (
            <Box
                component="form"
                onSubmit={
                  handleEmailOtpSubmit
                }
            >
              <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
              >
                We sent a verification
                code to {email}
              </Typography>

              {renderOtpInput(
                  "Enter verification code",
                  emailOtp,
                  setEmailOtp,
                  emailOtpError,
                  emailOtpTouched,
              )}

              <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
              >
                {loading
                    ? "Verifying..."
                    : "Verify Email"}
              </Button>

              <Box
                  sx={{
                    mt: 2,
                    textAlign: "center",
                  }}
              >
                <MuiLink
                    component="button"
                    type="button"
                    onClick={async () => {
                      clearError();

                      setEmailOtpError(
                          null,
                      );

                      setEmailOtpTouched(
                          false,
                      );

                      await sendEmailVerificationOtp(
                          email,
                      );
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

        {/* ======================================================
          STEP 3 — MSG91 PHONE OTP
         ====================================================== */}
        {step === 3 && (
            <Box>
              <Script
                  id="msg91-otp-widget-script"
                  src="https://verify.msg91.com/otp-provider.js"
                  strategy="afterInteractive"
                  onLoad={initializeMsg91Widget}
                  onError={() =>
                      setPhoneWidgetError(
                          "Unable to load MSG91 OTP widget. Please check your internet connection and MSG91 configuration.",
                      )
                  }
              />

              <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
              >
                Verify your phone number{" "}
                <strong>
                  {phone}
                </strong>{" "}
                using the MSG91 OTP
                widget.
              </Typography>

              {phoneWidgetError ? (
                  <Alert
                      severity="error"
                      sx={{ mb: 2 }}
                      onClose={() =>
                          setPhoneWidgetError(
                              null,
                          )
                      }
                  >
                    {phoneWidgetError}
                  </Alert>
              ) : (
                  <Box
                      sx={{
                        minHeight: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "center",
                      }}
                  >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                      Opening MSG91 verification...
                    </Typography>
                  </Box>
              )}
            </Box>
        )}

        {/* ======================================================
          STEP 4 — SUCCESS
         ====================================================== */}
        {step === 4 && (
            <Box
                sx={{
                  textAlign: "center",
                }}
            >
              {completeSuccess ? (
                  <Alert severity="success">
                    Your account has been
                    created successfully.
                    Redirecting you to
                    login...
                  </Alert>
              ) : null}
            </Box>
        )}
      </AuthCard>
  );
}

