"use client";

import { Container, Typography } from "@mui/material";

import ProductCarousel from "@/components/products/ProductCarousel";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

/**
 * Electronics strip — receives a pre-filtered subset of the backend
 * catalogue in electronics categories. The original visual is preserved
 * exactly.
 */
export default function ElectronicsSection({ products }: Props) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1.5, sm: 2.5, md: 5 } }}>
<Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: { xs: 1.5, sm: 2, md: 3 },
          }}
        >
        💻 Electronics
      </Typography>

      <ProductCarousel products={products} />
    </Container>
  );
}
