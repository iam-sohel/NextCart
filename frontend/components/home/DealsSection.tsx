"use client";

import { Box, Container } from "@mui/material";
import SectionTitle from "./sectiontitle";
import ProductCarousel from "../products/ProductCarousel";
import deals from "@/data/deals";

export default function DealsSection() {
  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 2,
          p: 3,
        }}
      >
        <SectionTitle title="🔥 Top Deals" />

        <ProductCarousel products={deals} />
      </Box>
    </Container>
  );
}