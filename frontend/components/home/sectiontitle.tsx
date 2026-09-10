"use client";

import { Box, Button, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface Props {
  title: string;
}

/**
 * NEXTCART — Reusable section heading.
 *
 * Presentation-only component: a consistent heading treatment used across
 * the homepage sections. It has NO navigation behavior (and deliberately
 * keeps it that way — no links, no invented business logic).
 */
export default function SectionTitle({ title }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        mb: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minWidth: 0,
        }}
      >
        {/* Orange accent tick — consistent section identity across the page */}
        <Box
          aria-hidden
          sx={{
            width: 4,
            height: { xs: 22, md: 26 },
            borderRadius: 100,
            bgcolor: "primary.main",
            flexShrink: 0,
          }}
        />

        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        size="small"
        endIcon={
          <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
        }
        sx={{
          borderRadius: 100,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.8125rem",
          px: 2,
          py: 0.5,
          borderColor: "divider",
          color: "text.primary",
          flexShrink: 0,
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "action.hover",
            color: "primary.dark",
          },
        }}
      >
        View All
      </Button>
    </Box>
  );
}