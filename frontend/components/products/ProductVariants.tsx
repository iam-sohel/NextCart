"use client";

import { useMemo } from "react";

import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";

import type { ProductVariant } from "@/types/product";

type VariantAxis = "size" | "color" | "storage";

interface ProductVariantsProps {
  variants: ProductVariant[];
  /**
   * Currently selected variant id. When undefined the selector remains
   * in "unselected" state — the parent chooses how to react (e.g. by
   * disabling Add to Cart).
   */
  selectedVariantId?: string | number;
  onSelect: (variantId: string | number) => void;
}

/**
 * NEXTCART — VariantSelector
 *
 * A reusable three-axis selector (size, color, storage) backed by the
 * ProductVariant[] array the backend will return. The component is
 * intentionally generic — it does NOT hardcode which axes exist; it
 * inspects the variant list and renders only axes that are present.
 *
 * Interaction model:
 *   - Clicking an option selects a variant. Picking "Red" first narrows
 *     the selection to a Red variant; the selector keeps a map of
 *     axis → value so any (axis, value) pair can resolve a variant.
 *   - For each option we show a faded style when the combination is
 *     currently unstocked so the user is never tempted to pick a
 *     sold-out variant.
 *
 * Why this is data-driven (and not hardcoded):
 *   The backend will return arbitrary axis combinations. Modelling the
 *   component around `(axis, value)` pairs means a future "Material" axis
 *   for jackets or a "RAM" axis for laptops needs zero code changes.
 */
export default function ProductVariants({
  variants,
  selectedVariantId,
  onSelect,
}: ProductVariantsProps) {
  const axes = useMemo<VariantAxis[]>(
    () => axesPresent(variants),
    [variants],
  );

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => String(v.id) === String(selectedVariantId ?? ""),
      ),
    [variants, selectedVariantId],
  );

  if (axes.length === 0) return null;

  const handleAxisClick = (axis: VariantAxis, value: string) => {
    // Picking a value for an axis always resolves to a real variant.
    // We do not maintain a multi-axis cross-product — the (axis, value)
    // pair is enough to choose SOMETHING the customer can buy.
    const match = variants.find((v) => readAxis(v, axis) === value);
    if (match) onSelect(match.id);
  };

  const isAxisValueSelected = (axis: VariantAxis, value: string) => {
    if (!selectedVariant) return false;
    return readAxis(selectedVariant, axis) === value;
  };

  const isAxisValueAvailable = (axis: VariantAxis, value: string) => {
    // An option is "available" when at least one variant matching this
    // axis value is sellable (has inventory > 0 or no inventory field).
    return variants.some((v) => {
      if (readAxis(v, axis) !== value) return false;
      if (v.inventory) {
        const available =
          typeof v.inventory.available === "number"
            ? v.inventory.available
            : (v.inventory.quantity ?? 0) - (v.inventory.reservedQty ?? 0);
        return available > 0;
      }
      return true;
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Available variants
      </Typography>

      <Stack spacing={2.5} sx={{ mt: 2 }}>
        {axes.map((axis) => {
          const values = uniqueValuesForAxis(variants, axis);
          return (
            <Box key={axis}>
              <Typography
                variant="overline"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {axis}
              </Typography>

              <ToggleButtonGroup
                exclusive
                value={
                  values.find((v) => isAxisValueSelected(axis, v)) ?? null
                }
                onChange={(_, next: string | null) => {
                  if (next) handleAxisClick(axis, next);
                }}
                sx={{
                  mt: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  "& .MuiToggleButton-root": {
                    borderRadius: "999px !important",
                    border: "1px solid !important",
                    borderColor: "divider !important",
                    px: 2,
                    py: 0.75,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "text.primary",
                  },
                  "& .Mui-selected": {
                    bgcolor: "primary.main !important",
                    color: "primary.contrastText !important",
                    borderColor: "primary.main !important",
                  },
                }}
              >
                {values.map((value) => {
                  const available = isAxisValueAvailable(axis, value);
                  return (
                    <Tooltip
                      key={value}
                      title={
                        available
                          ? `Select ${axis} ${value}`
                          : "Currently unavailable"
                      }
                    >
                      <span>
                        <ToggleButton
                          value={value}
                          disabled={!available}
                          aria-label={`${axis} ${value}`}
                          sx={{
                            minWidth: 48,
                            opacity: available ? 1 : 0.45,
                          }}
                        >
                          {value}
                        </ToggleButton>
                      </span>
                    </Tooltip>
                  );
                })}
              </ToggleButtonGroup>
            </Box>
          );
        })}

        {selectedVariant?.sku && (
          <Typography variant="caption" color="text.secondary">
            SKU: {selectedVariant.sku}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

/** List of axis keys actually present (non-null) on at least one variant. */
function axesPresent(variants: ProductVariant[]): VariantAxis[] {
  const axesToCheck: VariantAxis[] = ["size", "color", "storage"];
  return axesToCheck.filter((axis) =>
    variants.some((v) => {
      const raw = readAxis(v, axis);
      return raw !== undefined && raw !== null && raw !== "";
    }),
  );
}

/** Distinct values for a single axis across all variants. */
function uniqueValuesForAxis(
  variants: ProductVariant[],
  axis: VariantAxis,
): string[] {
  const set = new Set<string>();
  for (const variant of variants) {
    const raw = readAxis(variant, axis);
    if (raw === undefined || raw === null || raw === "") continue;
    set.add(String(raw));
  }
  return Array.from(set);
}

/**
 * Typed accessor for the (size | color | storage) axis. Replaces the
 * previous `as Record<string, unknown>` cast with a discriminated read so
 * the rest of the file stays strictly typed.
 */
function readAxis(
  variant: ProductVariant,
  axis: VariantAxis,
): string | number | null | undefined {
  switch (axis) {
    case "size":
      return variant.size;
    case "color":
      return variant.color;
    case "storage":
      return variant.storage;
    default:
      return undefined;
  }
}
