"use client";

import { useState } from "react";

import { Button, Snackbar, Alert } from "@mui/material";

import GoogleIcon from "@mui/icons-material/Google";

/**
 * NEXTCART — "Continue with Google" button
 *
 * V1 status: UI-only by design. Real Google OAuth requires:
 *   - a Google Cloud OAuth client (or a Spring-Social equivalent),
 *   - redirect URL configuration on the backend,
 *   - a callback handler that turns the Google `code` into a JWT in our
 *     own auth system (so the rest of the app stays backend-issued-token based).
 *
 * Until that integration exists we surface a polite "coming soon" message
 * instead of silently failing or inventing a fake OAuth flow.
 */
export default function SocialAuthButton() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleClick}
        sx={{
          py: 0.875,
          textTransform: "none",
          fontWeight: 600,
          borderColor: "divider",
          color: "text.primary",
          bgcolor: "background.paper",
          "&:hover": {
            bgcolor: "action.hover",
            borderColor: "primary.main",
          },
        }}
      >
        Continue with Google
      </Button>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Google sign-in will be available soon.
        </Alert>
      </Snackbar>
    </>
  );
}
