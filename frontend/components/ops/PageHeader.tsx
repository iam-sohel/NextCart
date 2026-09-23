"use client";

import type { ReactNode } from "react";

import { Box, Typography } from "@mui/material";

/**
 * NEXTCART — Ops PageHeader (shared seller/admin design system).
 *
 * Standard page heading for operations panels: title, optional subtitle,
 * and an optional right-aligned action slot (buttons, chips). Keeps every
 * module's heading hierarchy identical (h2 under the shell's h1).
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body1"
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
