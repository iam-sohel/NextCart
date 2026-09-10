"use client";

import { Box, Container } from "@mui/material";

import ProductCarousel from "@/components/products/ProductCarousel";
import SectionTitle from "./sectiontitle";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

/**
 * Electronics strip — receives a pre-filtered subset of the backend
 * catalogue in electronics categories.
 *
 * Presentation only: same white-surface treatment as the other home
 * sections, with the shared section heading. Filtering/data logic is
 * untouched.
 */
export default function ElectronicsSection({ products }: Props) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, md: 1.5 } }}>
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
        <SectionTitle title="💻 Electronics" />

        <ProductCarousel products={products} />
      </Box>
    </Container>
  );
}
