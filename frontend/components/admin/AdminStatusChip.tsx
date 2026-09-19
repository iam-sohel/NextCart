"use client";

import { Chip } from "@mui/material";

/**
 * NEXTCART — Admin status chip.
 *
 * Presentation-only status display for future admin modules. Callers supply
 * the status value and, when a backend status has a module-specific meaning,
 * an explicit tone. Unknown or arbitrary values safely fall back to neutral
 * styling without changing their text.
 */

export type AdminStatusTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

const TONE_STYLE: Record<AdminStatusTone, { bgcolor: string; color: string }> = {
  success: { bgcolor: "success.light", color: "success.main" },
  warning: { bgcolor: "warning.light", color: "warning.main" },
  error: { bgcolor: "error.light", color: "error.main" },
  info: { bgcolor: "info.light", color: "info.main" },
  neutral: { bgcolor: "grey.200", color: "text.secondary" },
};

function formatStatusValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    const text = value.trim().replace(/_/g, " ");
    if (!text) return "—";
    return text.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return String(value);
}

interface AdminStatusChipProps {
  status?: string | number | boolean | null;
  label?: string;
  tone?: AdminStatusTone;
}

export default function AdminStatusChip({
  status,
  label,
  tone = "neutral",
}: AdminStatusChipProps) {
  const text =
    label ??
    (status === null || status === undefined ? "—" : formatStatusValue(status));

  return (
    <Chip
      size="small"
      label={text}
      sx={{
        ...TONE_STYLE[tone],
        fontWeight: 700,
        maxWidth: "100%",
        "& .MuiChip-label": {
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        },
      }}
    />
  );
}
