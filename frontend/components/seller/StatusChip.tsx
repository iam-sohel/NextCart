"use client";

import { Chip } from "@mui/material";

/**
 * NEXTCART — Seller status badge.
 *
 * Maps the exact backend status values (KycStatus, BankVerificationStatus,
 * WarehouseStatus, seller verified/active booleans) to a consistent visual
 * tone. No invented states — unknown values fall back to a neutral chip.
 */

export type StatusTone = "success" | "warning" | "error" | "info" | "neutral";

const TONE_STYLE: Record<StatusTone, { bgcolor: string; color: string }> = {
  success: { bgcolor: "success.light", color: "success.main" },
  warning: { bgcolor: "warning.light", color: "warning.main" },
  error: { bgcolor: "error.light", color: "error.main" },
  info: { bgcolor: "info.light", color: "info.main" },
  neutral: { bgcolor: "grey.200", color: "text.secondary" },
};

export function toneForStatus(status?: string | null): StatusTone {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":
    case "VERIFIED":
    case "DELIVERED":
    case "PAID":
    case "COMPLETED":
      return "success";

    case "PENDING":
    case "UNDER_REVIEW":
    case "PROCESSING":
    case "RETURN_REQUESTED":
      return "warning";

    case "SHIPPED":
    case "RETURN_APPROVED":
      return "info";

    case "REJECTED":
    case "INACTIVE":
    case "FAILED":
    case "CANCELLED":
      return "error";

    default:
      return "neutral";
  }
}

export function humanizeStatus(status?: string | null): string {
  if (!status) return "—";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusChipProps {
  status?: string | null;
  label?: string;
  tone?: StatusTone;
}

export default function StatusChip({ status, label, tone }: StatusChipProps) {
  const resolvedTone = tone ?? toneForStatus(status);

  return (
    <Chip
      size="small"
      label={label ?? humanizeStatus(status)}
      sx={{ ...TONE_STYLE[resolvedTone], fontWeight: 700 }}
    />
  );
}
