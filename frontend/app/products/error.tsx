"use client";

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
 * NEXTCART — Products index error boundary.
 *
 * Triggered when the server component throws while loading the
 * catalogue. Provides a clear recovery path (retry + browse all).
 */
export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Header />

      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
          <Typography variant="overline" color="text.secondary">
            Something went wrong
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            We couldn&apos;t load the catalogue
          </Typography>
          <Typography color="text.secondary">
            {error?.message ||
              "The Spring Boot backend is unreachable. Please try again in a moment."}
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="large"
              onClick={() => reset()}
            >
              Try again
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
