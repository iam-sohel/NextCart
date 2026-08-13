"use client";

import { Rating, Stack, Typography } from "@mui/material";

interface ProductRatingRowProps {
  rating: number;
  reviewCount: number;
}

/**
 * NEXTCART — ProductRatingRow
 *
 * The product rating line shown under the product title. Decoupled from
 * ProductInfo so the orchestrator (ProductDetailsClient) can compose it
 * with other elements cleanly.
 */
export default function ProductRatingRow({
  rating,
  reviewCount,
}: ProductRatingRowProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "center", mt: 1.5 }}
    >
      <Rating value={rating} precision={0.5} readOnly size="medium" />
      <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
        {Number.isFinite(rating) ? rating.toFixed(1) : "—"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ({reviewCount.toLocaleString("en-IN")} ratings)
      </Typography>
    </Stack>
  );
}
