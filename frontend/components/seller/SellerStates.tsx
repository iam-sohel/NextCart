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
 * NEXTCART — Seller feedback states.
 *
 * Shared loading / error / empty treatments so every seller module presents
 * consistent, honest states (never fake content, never zero-as-error).
 */

export function SellerErrorState({
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
          <Button variant="outlined" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function SellerEmptyState({
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

        {action ? <Stack direction="row" spacing={1.5}>{action}</Stack> : null}
      </CardContent>
    </Card>
  );
}

export function SellerPageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <Stack spacing={3}>
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
