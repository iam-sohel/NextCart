"use client";

import type { ReactNode } from "react";

import { Box, Typography } from "@mui/material";

/**
 * HAVLOOK — Ops PageHeader (shared seller/admin design system).
 *
 * Standard page heading for operations panels: title, optional subtitle,
 * and an optional right-aligned action slot (buttons, chips). Keeps every
 * module's heading hierarchy identical (h2 under the shell's h1).
 *
 * `subtitleVariant` and `rowBreakpoint` exist so admin list pages (body2
 * subtitles, side-by-side from md) can adopt this component with zero
 * visual change. Defaults preserve the original rendering exactly.
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  subtitleVariant = "body1",
  rowBreakpoint = "sm",
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  subtitleVariant?: "body1" | "body2";
  rowBreakpoint?: "sm" | "md";
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", [rowBreakpoint]: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexDirection: { xs: "column", [rowBreakpoint]: "row" },
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant={subtitleVariant}
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {actions}
        </Box>
      ) : null}
    </Box>
  );
}
