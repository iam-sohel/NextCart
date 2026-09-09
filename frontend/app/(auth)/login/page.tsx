"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
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
  validatePhone,
} from "@/components/auth/validation";

import useAuthStore from "@/store/authStore";

type LoginMethod = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();

  const {
    login,
    loading,
    error,
    clearError,
  } = useAuthStore();

  const [loginMethod, setLoginMethod] =
      useState<LoginMethod>("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] =
      useState<string | null>(null);

  const [phoneError, setPhoneError] =
      useState<string | null>(null);

  const [passwordError, setPasswordError] =
      useState<string | null>(null);

  const [emailTouched, setEmailTouched] =
      useState(false);

  const [phoneTouched, setPhoneTouched] =
      useState(false);

  const [passwordTouched, setPasswordTouched] =
      useState(false);

  const [notice, setNotice] = useState<{
    severity: "success" | "info";
    text: string;
  } | null>(null);

  /*
   * Read signup redirect parameters.
   *
   * Email:
   * /login?registered=1&method=email&identifier=test@gmail.com
   *
   * Phone:
   * /login?registered=1&method=phone&identifier=9876543210
   */
  useEffect(() => {
    clearError();

    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(
        window.location.search,
    );

    const method = params.get("method");
    const identifier = params.get("identifier");

    if (method === "email") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoginMethod("email");

      if (identifier) {
        setEmail(identifier);
      }
    }

    if (method === "phone") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoginMethod("phone");

      if (identifier) {
        setPhone(identifier);
      }
    }

    let nextNotice:
        | {
      severity: "success" | "info";
      text: string;
    }
        | null = null;

    if (params.get("registered") === "1") {
      nextNotice = {
        severity: "success",
        text:
            "Account created successfully. Please sign in to continue.",
      };
    } else if (
        params.get("reason") === "session-expired"
    ) {
      nextNotice = {
        severity: "info",
        text:
            "Your session has expired. Please sign in again.",
      };
    } else if (
        params.get("reason") === "login-required"
    ) {
      nextNotice = {
        severity: "info",
        text: "Please sign in to continue.",
      };
    }

    if (nextNotice) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotice(nextNotice);
    }
  }, [clearError]);

  const handleMethodChange = (
      event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const method = event.target.value as LoginMethod;

    setLoginMethod(method);

    setEmailError(null);
    setPhoneError(null);
    setPasswordError(null);

    setEmailTouched(false);
    setPhoneTouched(false);
    setPasswordTouched(false);

    clearError();
  };

  const handleEmailBlur = () => {
    if (loginMethod !== "email") {
      return;
    }

    setEmailTouched(true);
    setEmailError(validateLoginEmail(email));
  };

  const handlePhoneBlur = () => {
    if (loginMethod !== "phone") {
      return;
    }

    setPhoneTouched(true);
    setPhoneError(validatePhone(phone));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(
        validateLoginPassword(password),
    );
  };

  const handleSubmit = async (
      event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    clearError();

    let identifier = "";

    if (loginMethod === "email") {
      const emailValidationError =
          validateLoginEmail(email);

      const passwordValidationError =
          validateLoginPassword(password);

      setEmailError(emailValidationError);
      setPasswordError(passwordValidationError);

      setEmailTouched(true);
      setPasswordTouched(true);

      if (
          emailValidationError ||
          passwordValidationError
      ) {
        return;
      }

      identifier = email.trim();
    } else {
      const phoneValidationError =
          validatePhone(phone);

      const passwordValidationError =
          validateLoginPassword(password);

      setPhoneError(phoneValidationError);
      setPasswordError(passwordValidationError);

      setPhoneTouched(true);
      setPasswordTouched(true);

      if (
          phoneValidationError ||
          passwordValidationError
      ) {
        return;
      }

      identifier = phone.replace(/\D/g, "");
    }

    const result = await login(
        identifier,
        password,
    );

    if (result.ok) {
      router.push("/");
    }
  };

  const formIsIncomplete =
      loginMethod === "email"
          ? !email.trim() || !password
          : !phone.trim() || !password;

  return (
      <AuthCard
          title="Welcome back"
          subtitle="Sign in to your NextCart account"
      >
        <Stack spacing={3}>
          {notice && (
              <Alert severity={notice.severity}>
                {notice.text}
              </Alert>
          )}

          {error && (
              <Alert severity="error">
                {error}
              </Alert>
          )}

          <Box>
            <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                }}
            >
              Sign in with
            </Typography>

            <FormControl component="fieldset">
              <RadioGroup
                  row
                  value={loginMethod}
                  onChange={handleMethodChange}
              >
                <FormControlLabel
                    value="email"
                    control={<Radio />}
                    label="Email"
                />

                <FormControlLabel
                    value="phone"
                    control={<Radio />}
                    label="Phone"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
          >
            <Stack spacing={2.5}>
              {loginMethod === "email" ? (
                  <TextField
                      fullWidth
                      name="email"
                      type="email"
                      label="Email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);

                        if (emailTouched) {
                          setEmailError(
                              validateLoginEmail(
                                  event.target.value,
                              ),
                          );
                        }

                        clearError();
                      }}
                      onBlur={handleEmailBlur}
                      error={
                          emailTouched &&
                          Boolean(emailError)
                      }
                      helperText={
                        emailTouched && emailError
                            ? emailError
                            : " "
                      }
                      autoComplete="email"
                      disabled={loading}
                  />
              ) : (
                  <TextField
                      fullWidth
                      name="phone"
                      type="tel"
                      label="Mobile number"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(event) => {
                        const value =
                            event.target.value.replace(
                                /\D/g,
                                "",
                            );

                        setPhone(value);

                        if (phoneTouched) {
                          setPhoneError(
                              validatePhone(value),
                          );
                        }

                        clearError();
                      }}
                      onBlur={handlePhoneBlur}
                      error={
                          phoneTouched &&
                          Boolean(phoneError)
                      }
                      helperText={
                        phoneTouched && phoneError
                            ? phoneError
                            : " "
                      }
                      autoComplete="tel"
                      slotProps={{
                        htmlInput: {
                          inputMode: "numeric",
                          maxLength: 10,
                        },
                      }}
                      disabled={loading}
                  />
              )}

              <PasswordField
                  label="Password"
                  name="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (passwordTouched) {
                      setPasswordError(
                          validateLoginPassword(
                              event.target.value,
                          ),
                      );
                    }

                    clearError();
                  }}
                  onBlur={handlePasswordBlur}
                  error={
                      passwordTouched &&
                      Boolean(passwordError)
                  }
                  helperText={
                    passwordTouched && passwordError
                        ? passwordError
                        : " "
                  }
                  autoComplete="current-password"
                  disabled={loading}
              />

              <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: -1,
                  }}
              >
                <Link
                    href="/forgot-password"
                    style={{
                      textDecoration: "none",
                      fontSize: "0.875rem",
                    }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={
                      loading ||
                      formIsIncomplete
                  }
              >
                {loading
                    ? "Signing in..."
                    : "Sign In"}
              </Button>
            </Stack>
          </Box>

          <OrDivider />

          <Stack spacing={1.5}>
            <SocialAuthButton />
          </Stack>

          <Typography
              variant="body2"
              sx={{
                textAlign: "center",
              }}
              color="text.secondary"
          >
            Don&apos;t have an account?{" "}
            <Link
                href="/signup"
                style={{
                  textDecoration: "none",
                  fontWeight: 600,
                }}
            >
              Create account
            </Link>
          </Typography>
        </Stack>
      </AuthCard>
  );
}