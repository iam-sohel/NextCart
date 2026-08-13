"use client";

import { Container, Typography } from "@mui/material";

import ProductCarousel from "@/components/products/ProductCarousel";
import electronics from "@/data/electronics";

export default function ElectronicsSection() {
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
        }}
      >
        💻 Electronics
      </Typography>

      <ProductCarousel products={electronics} />
    </Container>
  );
}
