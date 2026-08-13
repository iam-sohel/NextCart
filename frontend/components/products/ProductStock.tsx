"use client";

import { Box, Typography } from "@mui/material";

import type { InventoryState } from "@/utils/inventory";
import { stockLabel } from "@/utils/inventory";

interface ProductStockProps {
  inventory: InventoryState;
  /**
   * Optional override label. When the variant picks its own inventory
   * (e.g. "Only 3 of the 128GB left") we still display the canonical
   * status colour but allow custom text.
   */
  label?: string;
}

/**
 * NEXTCART — ProductStock
 *
 * A small inline indicator that tells the user whether a product/variant
 * is in stock, low on stock, or out of stock. Colour-coded via the theme
 * success/warning/error tokens — we never hardcode hex here.
 */
export default function ProductStock({
  inventory,
  label,
}: ProductStockProps) {
  const text = label ?? stockLabel(inventory);

  const color =
    inventory.status === "in_stock"
      ? "success.main"
      : inventory.status === "low_stock"
        ? "warning.main"
        : "error.main";

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ display: "flex", alignItems: "center", gap: 1 }}
    >
      <Box
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: color,
        }}
      />
      <Typography sx={{ fontWeight: 700, color }}>{text}</Typography>
    </Box>
  );
}
