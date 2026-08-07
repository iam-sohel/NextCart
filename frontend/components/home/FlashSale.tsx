"use client";

import { Container, Typography, Box } from "@mui/material";
import ProductCarousel from "@/components/products/ProductCarousel";
import products from "@/data/products";

export default function FlashSale() {
  const flashProducts = products.filter(
    (product) => product.discount >= 10
  );

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

      <ProductCarousel products={flashProducts} />
    </Container>
  );
}