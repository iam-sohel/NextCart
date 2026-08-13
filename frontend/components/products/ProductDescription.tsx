"use client";

import { Box, Stack, Typography } from "@mui/material";

interface ProductDescriptionProps {
  description: string;
  highlights?: string[];
}

/**
 * NEXTCART — ProductDescription
 *
 * Renders the long-form description and optional highlights list.
 *
 * - Description is rendered as plain typography (no dangerouslySetInnerHTML).
 *   When the backend eventually produces rich text we will introduce a
 *   sanitized renderer here.
 * - Highlights, when present, get a bulleted list with semantic <ul>/<li>.
 * - Layout caps the readable width so long paragraphs don't streak across
 *   desktop screens.
 */
export default function ProductDescription({
  description,
  highlights,
}: ProductDescriptionProps) {
  if (!description && (!highlights || highlights.length === 0)) return null;

  return (
    <Box
      component="section"
      aria-labelledby="product-description-heading"
      sx={{ mt: 4 }}
    >
      <Typography
        id="product-description-heading"
        variant="h5"
        sx={{ fontWeight: 700, mb: 2 }}
      >
        About this product
      </Typography>

      <Box sx={{ maxWidth: 760 }}>
        {description && (
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              lineHeight: 1.7,
              whiteSpace: "pre-line",
              wordBreak: "break-word",
            }}
          >
            {description}
          </Typography>
        )}

        {highlights && highlights.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Highlights
            </Typography>
            <Box
              component="ul"
              sx={{
                pl: 2.5,
                m: 0,
                color: "text.secondary",
                lineHeight: 1.8,
              }}
            >
              {highlights.map((item, idx) => (
                <Box
                  component="li"
                  key={`${item}-${idx}`}
                  sx={{ mb: 0.5 }}
                >
                  {item}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          mt: 3,
          color: "text.secondary",
          flexWrap: "wrap",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box component="span" aria-hidden>
            ✓
          </Box>
          <Typography variant="body2">
            Free delivery on eligible orders
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box component="span" aria-hidden>
            ✓
          </Box>
          <Typography variant="body2">7-day returns &amp; exchanges</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box component="span" aria-hidden>
            ✓
          </Box>
          <Typography variant="body2">Secure checkout</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
