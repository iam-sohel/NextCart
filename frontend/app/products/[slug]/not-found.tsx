import Link from "next/link";

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * NEXTCART — Product not-found
 *
 * Triggered by notFound() in the page when a slug does not match a
 * product. Provides a clear recovery path back to the catalogue.
 */
export default function ProductNotFound() {
  return (
    <>
      <Header />

      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
          <Typography variant="overline" color="text.secondary">
            404
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            We couldn&apos;t find that product
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The product you&apos;re looking for may have been removed or
            the link is incorrect. Try browsing all products or searching
            from the home page.
          </Typography>
          <Box>
            <Button
              component={Link}
              href="/products"
              variant="contained"
              size="large"
            >
              Browse all products
            </Button>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              size="large"
              sx={{ ml: 1.5 }}
            >
              Go to home
            </Button>
          </Box>
        </Stack>
      </Container>

      <Footer />
    </>
  );
}
