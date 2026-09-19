"use client";

import type { ReactNode } from "react";

import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

/**
 * NEXTCART — Admin feedback states.
 *
 * Shared loading, empty, error, and access-denied treatments for admin pages.
 * These states never invent business data: missing data is shown as missing,
 * and zero remains a valid backend value wherever a module reports it.
 */

export function AdminLoadingState({
  cards = 3,
  label = "Loading…",
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <Stack spacing={3} role="status" aria-live="polite" aria-busy="true">
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Skeleton variant="text" width={220} height={44} />
      <Skeleton variant="text" width={320} height={24} />

      {Array.from({ length: cards }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          height={180}
          sx={{ borderRadius: 3 }}
        />
      ))}
    </Stack>
  );
}

export function AdminErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card sx={{ borderRadius: 3, borderColor: "error.main" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Something went wrong
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {message}
        </Typography>

        {onRetry ? (
          <Button variant="outlined" onClick={onRetry} sx={{ minHeight: 44 }}>
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>

        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {description}
          </Typography>
        ) : null}

        {action ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            {action}
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminAccessDeniedState({
  title = "Access denied",
  description = "This area requires an administrator account.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <AdminEmptyState title={title} description={description} action={action} />
  );
}
