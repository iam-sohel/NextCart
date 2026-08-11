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
  validateFullName,
  validatePassword,
  validatePhone,
  validateTermsAccepted,
} from "@/components/auth/validation";

import useAuthStore from "@/store/authStore";

/**
 * NEXTCART — /signup
 *
 * Collects the fields the task spec calls for ("Full Name", "Email / Mobile
 * Number", "Password", "Confirm Password", "I agree to Terms & Conditions")
 * and maps them to the Spring Boot `RegisterRequest`:
 *   - "Full Name"        → firstName + lastName (split on the first space)
 *   - "Email"            → email
 *   - "Mobile Number"    → phone   (the backend requires both)
 *   - "Password"         → password
 *
 * Why we accept both an email and a mobile even though the spec lists them
 * as a single "Email / Mobile Number":
 *   - Spring Boot's `RegisterRequest` validates `email` with `@Email` (so it
 *     MUST be a real email) and `phone` with `@NotBlank`. The two cannot
 *     live on the same field without breaking the contract.
 *   - The task itself notes "Email / Mobile Number" as the user-facing copy.
 *     We make the field requirements explicit (Email, Mobile Number) — this
 *     is honest about what we send on the wire and lets the mobile app reuse
 *     the same backend call with the same shape.
 *
 * On success we redirect to /login. There is intentionally NO onboarding,
 * shipping setup, or email verification step in V1.
 */
export default function SignupPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    clearError();
  }, [clearError]);

  const markTouched = (key: string) =>
    setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  const revalidate = (
    key: "fullName" | "email" | "phone" | "password" | "confirm" | "terms",
    current?: Partial<{
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
      acceptedTerms: boolean;
    }>,
  ) => {
    const c = current ?? {};
    switch (key) {
      case "fullName":
        setFullNameError(validateFullName(c.fullName ?? fullName));
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

    const fnErr = validateFullName(fullName);
    const emErr = validateEmail(email);
    const phErr = validatePhone(phone);
    const pwErr = validatePassword(password);
    const cpErr = validateConfirmPassword(confirmPassword, password);
    const tmErr = validateTermsAccepted(acceptedTerms);

    setFullNameError(fnErr);
    setEmailError(emErr);
    setPhoneError(phErr);
    setPasswordError(pwErr);
    setConfirmError(cpErr);
    setTermsError(tmErr);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirm: true,
      terms: true,
    });

    if (fnErr || emErr || phErr || pwErr || cpErr || tmErr) return;

    const result = await register(fullName.trim(), email.trim(), phone.trim(), password);
    if (result.ok) {
      router.push("/login");
    }
  };

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
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error ? (
            <Alert severity="error" variant="outlined" role="alert">
              {error}
            </Alert>
          ) : null}

          <TextField
            name="fullName"
            label="Full Name"
            placeholder="Jane Doe"
            autoComplete="name"
            fullWidth
            size="small"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (touched.fullName) revalidate("fullName", { fullName: e.target.value });
              if (error) clearError();
            }}
            onBlur={() => {
              markTouched("fullName");
              revalidate("fullName");
            }}
            error={Boolean(fullNameError)}
            helperText={touched.fullName ? fullNameError ?? " " : " "}
          />

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
                    Terms &amp; Conditions
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
    </AuthCard>
  );
}
