"use client";

import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface QuantitySelectorProps {
  value: number;
  onChange: (next: number) => void;
  /** Maximum selectable quantity. Defaults to Infinity (e.g. unstocked). */
  max?: number;
  /** Minimum selectable quantity. Defaults to 1. */
  min?: number;
  /** Disable everything (e.g. when out of stock). */
  disabled?: boolean;
  /** Compact label above. When undefined we render just the control row. */
  label?: string;
}

/**
 * NEXTCART — QuantitySelector
 *
 * Reusable quantity stepper used in:
 *   - Product details page (Add to Cart flow)
 *   - Cart line items (increment / decrement)
 *   - Checkout review step
 *
 * Design rules:
 *   - `min` defaults to 1. Values below the floor are silently clamped.
 *   - `max` defaults to Infinity. When stock is finite we pass it explicitly.
 *   - Buttons have aria-labels so screen readers can announce them.
 *   - Keyboard users can also type a value directly into the input.
 *   - When `disabled` is true every interaction is locked.
 *
 * The selector is uncontrolled w.r.t. clamping: callers receive the
 * requested value already within bounds. We always emit a valid number
 * (never NaN, never negative).
 */
export default function QuantitySelector({
  value,
  onChange,
  max = Infinity,
  min = 1,
  disabled = false,
  label = "Quantity",
}: QuantitySelectorProps) {
  const safeMax = Math.max(min, Number.isFinite(max) ? max : Infinity);
  const canIncrease = !disabled && value < safeMax;
  const canDecrease = !disabled && value > min;

  const setValue = (next: number) => {
    if (disabled) return;
    if (!Number.isFinite(next)) {
      onChange(min);
      return;
    }
    const clamped = Math.min(safeMax, Math.max(min, Math.floor(next)));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <Box>
      {label && (
        <Typography
          component="span"
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
            mr: 2,
            display: "inline-block",
            mb: 1,
          }}
        >
          {label}
        </Typography>
      )}

      <Stack
        direction="row"
        spacing={0}
        sx={{
          alignItems: "stretch",
          display: "inline-flex",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 999,
          overflow: "hidden",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <IconButton
          aria-label={`Decrease ${label.toLowerCase()}`}
          onClick={() => setValue(value - 1)}
          disabled={!canDecrease}
          size="small"
          sx={{
            borderRadius: 0,
            px: 1.25,
            color: "text.primary",
            "&:hover": { bgcolor: "action.hover" },
            "&.Mui-disabled": { color: "text.disabled" },
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <TextField
          type="number"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          disabled={disabled}
          slotProps={{
            htmlInput: {
              "aria-label": `${label} value`,
              min,
              max: Number.isFinite(safeMax) ? safeMax : undefined,
              style: {
                textAlign: "center",
                padding: "8px 0",
                fontWeight: 600,
              },
            },
          }}
          sx={{
            width: 56,
            "& fieldset": { border: "none" },
            "& input": { MozAppearance: "textfield" },
            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
              {
                WebkitAppearance: "none",
                margin: 0,
              },
          }}
        />

        <IconButton
          aria-label={`Increase ${label.toLowerCase()}`}
          onClick={() => setValue(value + 1)}
          disabled={!canIncrease}
          size="small"
          sx={{
            borderRadius: 0,
            px: 1.25,
            color: "text.primary",
            "&:hover": { bgcolor: "action.hover" },
            "&.Mui-disabled": { color: "text.disabled" },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
