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
 * A reusable, data-driven selector that works against the backend's
 * `variants[].attributes` map. The component does NOT hardcode which
 * axes exist; it inspects the variant list and renders one group per
 * axis that is present on at least one variant.
 *
 * Why this is fully data-driven:
 *   The backend can return any axis name (Color, RAM, Storage, Size,
 *   Material, Capacity, Configuration, …). Treating the attribute map
 *   as the source of truth means a new "Material" or "RAM" axis needs
 *   zero code changes — the same selector handles them.
 *
 * Interaction model:
 *   - Clicking an option selects a variant. Picking "Red" first narrows
 *     the selection to a Red variant; the selector keeps a map of
 *     axis → value so any (axis, value) pair can resolve a variant.
 *   - For each option we show a faded style when the combination is
 *     currently unstocked so the user is never tempted to pick a
 *     sold-out variant.
 */
export default function ProductVariants({
  variants,
  selectedVariantId,
  onSelect,
}: ProductVariantsProps) {
  const axes = useMemo<string[]>(() => axesPresent(variants), [variants]);

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => String(v.id) === String(selectedVariantId ?? ""),
      ),
    [variants, selectedVariantId],
  );

  if (axes.length === 0) return null;

  const handleAxisClick = (axis: string, value: string) => {
    // Picking a value for an axis always resolves to a real variant.
    // We do not maintain a multi-axis cross-product — the (axis, value)
    // pair is enough to choose SOMETHING the customer can buy.
    const match = variants.find((v) => readAxis(v, axis) === value);
    if (match) onSelect(match.id);
  };

  const isAxisValueSelected = (axis: string, value: string) => {
    if (!selectedVariant) return false;
    return readAxis(selectedVariant, axis) === value;
  };

  const isAxisValueAvailable = (axis: string, value: string) => {
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

/**
 * List the attribute axes that are present (non-null, non-empty) on at
 * least one variant. We use the `attributes` map (the backend's source
 * of truth) and fall back to the well-known typed fields so legacy
 * variants without an `attributes` block still render.
 *
 * The resulting array preserves the order the backend sent the keys in
 * (Object.entries order is insertion order in modern JS), so the UI
 * mirrors whatever order the backend chose.
 */
function axesPresent(variants: ProductVariant[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const consider = (key: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(key);
  };

  for (const variant of variants) {
    // Prefer the backend's `attributes` map (the canonical source).
    if (variant.attributes && typeof variant.attributes === "object") {
      for (const key of Object.keys(variant.attributes)) {
        const v = variant.attributes[key];
        if (v === undefined || v === null || v === "") continue;
        consider(key);
      }
    }
    // Also surface the legacy typed fields so older mock data keeps
    // working alongside the dynamic map.
    for (const key of ["size", "color", "storage"] as const) {
      const v = variant[key];
      if (v === undefined || v === null || v === "") continue;
      consider(key);
    }
  }
  return ordered;
}

/** Distinct values for a single axis across all variants. */
function uniqueValuesForAxis(
  variants: ProductVariant[],
  axis: string,
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
 * Read the value of an axis for a variant. Prefers the dynamic
 * `attributes` map; falls back to the legacy typed fields for
 * backwards compatibility with mock data.
 */
function readAxis(
  variant: ProductVariant,
  axis: string,
): string | number | null | undefined {
  // Dynamic map first — the backend's source of truth.
  if (variant.attributes && Object.prototype.hasOwnProperty.call(variant.attributes, axis)) {
    return variant.attributes[axis] as string | number | null;
  }
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
