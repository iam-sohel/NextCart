"use client";

import { Box, Container, Grid, Skeleton, Stack } from "@mui/material";

/**
 * NEXTCART — ProductDetailsSkeleton
 *
 * Skeleton placeholder for the product details page. Rendered by
 * app/products/[slug]/loading.tsx so navigation feels instant.
 *
 * The skeleton mirrors the page layout (gallery + info side-by-side on
 * desktop, stacked on mobile) so layout shift is minimised when the real
 * content swaps in.
 */
export default function ProductDetailsSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton
            variant="rounded"
            height={520}
            sx={{ borderRadius: 2 }}
          />
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={88}
                height={88}
                sx={{ borderRadius: 1.5 }}
              />
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" sx={{ fontSize: "2.5rem" }} />
          <Skeleton variant="text" width={200} />
          <Skeleton
            variant="rounded"
            height={64}
            sx={{ mt: 3, borderRadius: 1.5 }}
          />
          <Skeleton
            variant="rounded"
            height={120}
            sx={{ mt: 3, borderRadius: 1.5 }}
          />
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Skeleton variant="rounded" height={44} width={120} />
            <Skeleton variant="rounded" height={44} width={120} />
          </Stack>
          <Skeleton
            variant="rounded"
            height={48}
            sx={{ mt: 3, borderRadius: 999 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Skeleton variant="text" width={180} height={32} />
        <Skeleton variant="rounded" height={240} sx={{ mt: 2 }} />
      </Box>
    </Container>
  );
}
