"use client";

import { Box, GlobalStyles, Typography } from "@mui/material";

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
  /**
   * Visual style of the status dot. "pulse" gently animates the dot on
   * low-stock ("Only N left") to draw the eye; "static" is the default.
   */
  indicator?: "static" | "pulse";
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
  indicator = "static",
}: ProductStockProps) {
  const text = label ?? stockLabel(inventory);

  const color =
    inventory.status === "in_stock"
      ? "success.main"
      : inventory.status === "low_stock"
        ? "warning.main"
        : "error.main";

  const shouldPulse = indicator === "pulse" && inventory.status === "low_stock";

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ display: "flex", alignItems: "center", gap: 1 }}
    >
      {shouldPulse && (
        <GlobalStyles
          styles={{
            "@keyframes nextcart-stock-pulse": {
              "0%, 100%": { opacity: 1, transform: "scale(1)" },
              "50%": { opacity: 0.45, transform: "scale(0.8)" },
            },
          }}
        />
      )}
      <Box
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: color,
          ...(shouldPulse && {
            animation: "nextcart-stock-pulse 1.6s ease-in-out infinite",
          }),
        }}
      />
      <Typography sx={{ fontWeight: 700, color, fontSize: "0.9375rem" }}>
        {text}
      </Typography>
    </Box>
  );
}
