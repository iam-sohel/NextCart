"use client";

import { Box, Container, Grid, Skeleton } from "@mui/material";

/**
 * NEXTCART — CartSkeleton
 *
 * Loading placeholder that mirrors the upgraded cart layout — item rows
 * on the left, summary card on the right — so the swap from skeleton to
 * content causes minimal layout shift. Rendered while the existing
 * fetchCart() call is in flight; no data-fetching changes.
 */
export default function CartSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Heading. */}
      <Skeleton variant="text" width={220} height={36} />

      <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: { xs: 1, md: 2 } }}>
        {/* Item rows. */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: { xs: 2, md: 3 },
              px: { xs: 2, md: 3 },
              py: 1,
            }}
          >
            {[0, 1, 2].map((row) => (
              <Box
                key={row}
                sx={{
                  display: "flex",
                  gap: 2.5,
                  py: 2.5,
                  borderBottom:
                    row < 2 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                <Skeleton
                  variant="rounded"
                  width={112}
                  height={112}
                  sx={{ borderRadius: 2, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="35%" height={20} />
                  <Skeleton variant="text" width={120} height={28} sx={{ mt: 1 }} />
                  <Box
                    sx={{
                      display: "inline-flex",
                      mt: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Skeleton variant="rectangular" width={40} height={40} />
                    <Skeleton
                      variant="rectangular"
                      width={44}
                      height={40}
                      sx={{ borderLeft: "1px solid", borderRight: "1px solid", borderColor: "divider" }}
                    />
                    <Skeleton variant="rectangular" width={40} height={40} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Summary card. */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: { xs: 2, md: 3 },
              p: 3,
            }}
          >
            <Skeleton variant="text" width={140} height={28} />
            <Skeleton variant="rounded" height={1} sx={{ my: 2.5 }} />
            {[0, 1, 2].map((row) => (
              <Box
                key={row}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
              >
                <Skeleton variant="text" width={90} height={22} />
                <Skeleton variant="text" width={60} height={22} />
              </Box>
            ))}
            <Skeleton variant="rounded" height={1} sx={{ my: 2.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Skeleton variant="text" width={100} height={30} />
              <Skeleton variant="text" width={90} height={30} />
            </Box>
            <Skeleton
              variant="rounded"
              height={48}
              sx={{ mt: 3, borderRadius: 2 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
