"use client";

import { Box, Container } from "@mui/material";
import SectionTitle from "./sectiontitle";
import ProductCarousel from "@/components/products/ProductCarousel";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

/**
 * HAVLOOK — Fashion strip.
 *
 * Receives a pre-filtered subset of the backend catalogue
 * in fashion categories. Presentation only: same
 * white-surface treatment as the other home sections,
 * with the shared section heading. Filtering/data logic
 * is untouched.
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