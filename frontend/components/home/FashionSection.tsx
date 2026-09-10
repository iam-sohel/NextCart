"use client";

import { Box, Container } from "@mui/material";
import SectionTitle from "./sectiontitle";
import ProductCarousel from "../products/ProductCarousel";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

/**
 * Fashion strip — receives a pre-filtered subset of the backend
 * catalogue in fashion categories. The original visual is preserved
 * exactly.
 */
export default function FashionSection({ products }: Props) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 1.5, sm: 2 } }}>
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: { xs: 1.5, sm: 2, md: 3 },
          boxShadow: 1,
        }}
      >
        <SectionTitle title="👕 Fashion Picks" />

        <ProductCarousel products={products} />
      </Box>
    </Container>
  );
}
