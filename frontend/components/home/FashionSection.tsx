"use client";

import { Box, Container } from "@mui/material";
import SectionTitle from "./sectiontitle";
import ProductCarousel from "../products/ProductCarousel";
import fashion from "@/data/fashion";

export default function FashionSection() {
  const fashionProducts = fashion.map((product) => ({
    ...product,
    slug: product.title.toLowerCase().replace(/\s+/g, "-"),
  }));

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 2,
          p: 3,
        }}
      >
        <SectionTitle title="👕 Fashion Picks" />

        <ProductCarousel products={fashionProducts} />
      </Box>
    </Container>
  );
}