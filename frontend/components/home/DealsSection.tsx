"use client";

import { Box, Container } from "@mui/material";
import SectionTitle from "./sectiontitle";
import ProductCarousel from "../products/ProductCarousel";
import deals from "@/data/deals";

const dealsWithSlug = deals.map((deal) => ({
  ...deal,
  slug: deal.id.toString(),
}));

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

        <ProductCarousel products={dealsWithSlug} />
      </Box>
    </Container>
  );
}