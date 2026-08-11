"use client";

import { Box, Divider, Typography } from "@mui/material";

/**
 * NEXTCART — "─── OR ───" divider used between primary auth and social auth.
 * Pure presentational — keeps both pages visually consistent.
 */
interface OrDividerProps {
  label?: string;
}

export default function OrDivider({ label = "OR" }: OrDividerProps) {
  return (
    <Box
      role="separator"
      aria-label={label}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        color: "text.secondary",
        my: 1,
      }}
    >
      <Divider sx={{ flex: 1 }} />
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontWeight: 600,
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
}
