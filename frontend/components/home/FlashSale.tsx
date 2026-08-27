"use client";

import { Container, Typography, Box } from "@mui/material";
import ProductCarousel from "@/components/products/ProductCarousel";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

/**
 * Flash Sale strip — receives a pre-filtered subset of the backend
 * catalogue. Visual is preserved exactly from the previous
 * mock-data-driven implementation.
 */
export default function FlashSale({ products }: Props) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          ⚡ Flash Sale
        </Typography>

        <Typography
          color="primary"
          sx={{
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          View All
        </Typography>
      </Box>

      <ProductCarousel products={products} />
    </Container>
  );
}
