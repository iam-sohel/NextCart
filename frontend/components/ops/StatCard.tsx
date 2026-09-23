"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import { Box, Button, Card, CardContent, Typography } from "@mui/material";

/**
 * NEXTCART — Ops StatCard (shared seller/admin design system).
 *
 * Single KPI tile: optional leading icon in a primary-tint square, a strong
 * value, and a muted label. An optional footer action links to the module
 * that owns the metric. Values are always caller-formatted strings —
 * this component never computes business numbers.
 */
export default function StatCard({
  icon,
  value,
  label,
  sub,
  actionLabel,
  actionHref,
}: {
  icon?: ReactNode;
  value: ReactNode;
  label: string;
  sub?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent
        sx={{
          p: 2.5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          "&:last-child": { pb: 2.5 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icon ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "action.selected",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          ) : null}
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: 700, minWidth: 0, overflowWrap: "anywhere" }}
          >
            {value}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>

        {sub ? (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        ) : null}

        {actionLabel && actionHref ? (
          <Box sx={{ mt: "auto", pt: 1 }}>
            <Button
              component={Link}
              href={actionHref}
              variant="text"
              size="small"
              sx={{ px: 0, minHeight: 32 }}
            >
              {actionLabel}
            </Button>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}
