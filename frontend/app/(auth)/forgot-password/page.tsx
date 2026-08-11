"use client";

import Link from "next/link";

import { Alert, Box, Button, Link as MuiLink, Stack, Typography } from "@mui/material";

import AuthCard from "@/components/auth/AuthCard";

/**
 * NEXTCART — /forgot-password
 *
 * V1 placeholder. The login page links here so the user never hits a dead end.
 * The "real" reset-password flow requires:
 *   - a Spring Boot endpoint that issues a single-use, time-boxed token
 *     (e.g. `POST /api/v1/auth/forgot`),
 *   - transactional email delivery (or a backend stub) to send the reset
 *     link, and
 *   - a matching `/reset-password?token=…` page.
 * Until those exist we render a polite notification.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
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
        <Alert severity="info" variant="outlined">
          Password recovery will be available soon. Please contact support if
          you cannot access your account.
        </Alert>

        <Box>
          <Button
            component={Link}
            href="/login"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.125,
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: 1,
            }}
          >
            Back to Sign In
          </Button>
        </Box>
      </Stack>
    </AuthCard>
  );
}
