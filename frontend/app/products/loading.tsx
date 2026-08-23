import {
  Box,
  Container,
  Grid,
  Skeleton,
  Stack,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * NEXTCART — Products index loading state.
 *
 * Renders a non-interactive skeleton that mirrors the products page
 * layout (header + grid of card placeholders). Used by Next.js as the
 * Suspense fallback while the server component fetches the catalogue
 * from the Spring Boot backend.
 */
export default function ProductsLoading() {
  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={220} height={48} />
          <Skeleton variant="text" width={320} height={22} />
        </Box>

        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid
              key={index}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            >
              <Stack
                spacing={1.5}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={220}
                  animation="wave"
                />
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="text" width="40%" height={16} />
                  <Skeleton variant="text" width="90%" height={24} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton
                    variant="rounded"
                    height={40}
                    sx={{ mt: 1.5 }}
                  />
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </>
  );
}
