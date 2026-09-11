"use client";

import StarIcon from "@mui/icons-material/Star";
import { Box, Rating, Stack, Typography } from "@mui/material";

interface ProductRatingRowProps {
  rating: number;
  reviewCount: number;
}

/**
 * NEXTCART — ProductRatingRow
 *
 * The product rating line shown under the product title, Flipkart-style:
 * a green rating capsule (score + star) followed by the ratings count.
 * The MUI Rating stars act as the accessible fallback for the numeric
 * value; the capsule is decorative.
 *
 * Decoupled from ProductInfo so the orchestrator (ProductDetailsClient)
 * can compose it with other elements cleanly.
 */
export default function ProductRatingRow({
  rating,
  reviewCount,
}: ProductRatingRowProps) {
  const hasRating = Number.isFinite(rating) && rating > 0;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "center", mt: 1.5, flexWrap: "wrap", rowGap: 0.5 }}
    >
      {hasRating && (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: "success.light",
            color: "success.main",
            borderRadius: 1,
            px: 0.75,
            py: 0.25,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              lineHeight: 1.6,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {rating.toFixed(1)}
          </Typography>
          <StarIcon sx={{ fontSize: 13 }} />
        </Box>
      )}

      <Rating value={rating} precision={0.5} readOnly size="small" />

      <Typography variant="body2" color="text.secondary">
        ({reviewCount.toLocaleString("en-IN")} ratings)
      </Typography>
    </Stack>
  );
}
