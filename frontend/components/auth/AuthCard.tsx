"use client";

import Link from "next/link";

import { Box, Card, CardContent, Container, Stack, Typography } from "@mui/material";

/**
 * NEXTCART — AuthCard
 *
 * The single source of truth for the auth-screen look-and-feel. Both
 * `/login` and `/signup` render inside this card so they look like the
 * same product without duplicating the layout code.
 *
 * Layout intent:
 *   - Mobile-first: card stretches edge-to-edge with comfortable padding
 *     on phones; centered with `max-width` on larger screens.
 *   - Compact commerce density (no oversized hero / marketing panel).
 *   - Clean, single column. Logo + title + subtitle at the top, form
 *     slots in the middle, the secondary "switch mode" link at the bottom.
 *
 * Why a "card"?
 *   - Mirrors the existing `MuiCard` styling (1px border, 8px radius,
 *     paper background, no heavy shadow) used by product / order cards.
 *   - Renders the same across every breakpoint without media queries
 *     inside the page bodies.
 */

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Slot rendered below the form (e.g. the "Already have an account?" link). */
  footer?: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
        py: { xs: 4, sm: 6, md: 8 },
        minHeight: "100dvh",
      }}
    >
      <Container maxWidth="sm" disableGutters sx={{ width: "100%" }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            width: "100%",
            mx: "auto",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>
              {/* Brand mark — links home, mirrors the navbar logo behavior */}
              <Box sx={{ textAlign: "center" }}>
                <Link
                  href="/"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                  aria-label="NextCart home"
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "secondary.main",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    NextCart
                  </Typography>
                </Link>
              </Box>

              <Stack spacing={1}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "1.75rem" },
                    fontWeight: 700,
                    color: "text.primary",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </Typography>

                <Typography
                  component="p"
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  {subtitle}
                </Typography>
              </Stack>

              {children}

              {footer ? (
                <Box
                  sx={{
                    pt: 1,
                    textAlign: "center",
                  }}
                >
                  {footer}
                </Box>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
