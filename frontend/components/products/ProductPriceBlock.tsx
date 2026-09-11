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
 * price, the discount chip, and an explicit "You save" line (Flipkart
 * pattern — makes the deal legible at a glance).
 *
 * Never duplicates formatter logic: all amounts go through the shared
 * formatters in `utils/formatPrice`.
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

  const savings =
    showOriginal && typeof originalPrice === "number"
      ? originalPrice - price
      : 0;

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1.5}
        useFlexGap
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}
      >
        <Typography
          sx={{
            fontSize: { xs: "1.5rem", sm: "1.625rem", md: "1.75rem" },
            fontWeight: 700,
            color: "text.primary",
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatPrice(price)}
        </Typography>

        {showOriginal && (
          <Typography
            variant="body1"
            sx={{
              textDecoration: "line-through",
              color: "text.secondary",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
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
            size="small"
            label={formatDiscountPercent(discountPct)}
            sx={{ fontWeight: 700 }}
          />
        )}
      </Stack>

      {savings > 0 && (
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            fontWeight: 600,
            color: "success.main",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          You save {formatPrice(savings)}
        </Typography>
      )}
    </Box>
  );
}
