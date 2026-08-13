"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";

import {
  computeDiscountPercent,
  formatDiscountPercent,
  formatPrice,
} from "@/utils/formatPrice";

interface ProductPriceBlockProps {
  price: number;
  originalPrice?: number;
}

/**
 * NEXTCART — ProductPriceBlock
 *
 * Single visual block used on the product details page. Always renders
 * the active price; conditionally renders the strike-through original
 * price and the discount chip. Never duplicates formatter logic.
 */
export default function ProductPriceBlock({
  price,
  originalPrice,
}: ProductPriceBlockProps) {
  const discountPct = computeDiscountPercent(originalPrice, price);
  const showOriginal =
    typeof originalPrice === "number" &&
    Number.isFinite(originalPrice) &&
    originalPrice > price;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      useFlexGap
      sx={{ alignItems: "center", flexWrap: "wrap" }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "text.primary" }}
      >
        {formatPrice(price)}
      </Typography>

      {showOriginal && (
        <Typography
          variant="body1"
          sx={{
            textDecoration: "line-through",
            color: "text.secondary",
          }}
          aria-label={`Original price ${formatPrice(originalPrice)}`}
        >
          {formatPrice(originalPrice)}
        </Typography>
      )}

      {discountPct > 0 && (
        <Chip
          color="success"
          variant="filled"
          label={formatDiscountPercent(discountPct)}
          sx={{ fontWeight: 700 }}
        />
      )}

      {/* Save a bit of vertical space and aid screen readers */}
      <Box component="span" sx={{ display: "none" }}>
        {showOriginal
          ? `Save ${formatPrice((originalPrice ?? 0) - price)}`
          : ""}
      </Box>
    </Stack>
  );
}
