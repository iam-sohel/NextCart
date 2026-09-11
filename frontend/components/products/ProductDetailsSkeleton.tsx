"use client";

import { Box, Container, Grid, Skeleton, Stack } from "@mui/material";

/**
 * NEXTCART — ProductDetailsSkeleton
 *
 * Skeleton placeholder for the product details page. Rendered by
 * app/products/[slug]/loading.tsx so navigation feels instant.
 *
 * The skeleton mirrors the upgraded page layout — a single white product
 * card containing the gallery + info columns (stacked on mobile) with the
 * below-the-fold sections underneath — so layout shift is minimised when
 * the real content swaps in.
 */
export default function ProductDetailsSkeleton() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "60vh" }}>
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, md: 3 } }}>
        {/* Main product card. */}
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 2, md: 3 },
            mt: { xs: 1.5, md: 3 },
          }}
        >
          <Grid
            container
            sx={{
              px: { xs: 1.5, sm: 2.5, md: 4 },
              py: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {/* Gallery column. */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton
                variant="rounded"
                sx={{
                  height: { xs: 340, sm: 440, md: 520 },
                  borderRadius: { xs: 2, md: 3 },
                }}
              />
              <Stack direction="row" spacing={1.25} sx={{ mt: 1.5 }}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    sx={{
                      width: { xs: 64, md: 76 },
                      height: { xs: 64, md: 76 },
                      borderRadius: 1.5,
                    }}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Info column. */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                spacing={2}
                sx={{ pl: { md: 4 }, mt: { xs: 3, md: 0 } }}
              >
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
                <Skeleton variant="rounded" height={28} width={180} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" height={44} width={220} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" height={36} width="70%" sx={{ borderRadius: 999 }} />
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Skeleton variant="rounded" width={120} height={24} />
                </Stack>
                <Skeleton
                  variant="rounded"
                  height={44}
                  width={140}
                  sx={{ borderRadius: 999 }}
                />
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <Skeleton
                    variant="rounded"
                    height={48}
                    sx={{ flex: 1, borderRadius: 2 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={48}
                    sx={{ flex: 1, borderRadius: 2 }}
                  />
                </Stack>
                <Skeleton
                  variant="rounded"
                  height={140}
                  sx={{ mt: 2, borderRadius: 2 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Below-the-fold section. */}
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width={180} height={32} />
          <Skeleton
            variant="rounded"
            height={240}
            sx={{ mt: 2, borderRadius: 2 }}
          />
        </Box>
      </Container>
    </Box>
  );
}
