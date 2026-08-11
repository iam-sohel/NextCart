/**
 * NEXTCART — (auth) route group layout
 *
 * `/login`, `/signup`, `/forgot-password` etc. live under `app/(auth)/`.
 * Putting them inside a `(auth)` route group lets them share a layout
 * without changing the URL (the parentheses are NOT part of the path).
 *
 * Why a dedicated layout?
 *   - Auth screens should not show the global `Navbar` / `Footer` —
 *     a checkout-style flow expects a focused, distraction-free page.
 *   - When we add a "/checkout" or "/account" group later, we can give it
 *     its own layout (with the Navbar) while this group stays minimal.
 *
 * Performance:
 *   - We render only `{children}` here — no Navbar, no Footer, no providers
 *     beyond the global ThemeRegistry (which already wraps the whole tree
 *     from `app/layout.tsx`).
 */

import type { Metadata } from "next";

import { Box } from "@mui/material";

export const metadata: Metadata = {
  title: "Sign in • NextCart",
  description: "Sign in or create a NextCart account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {children}
    </Box>
  );
}
