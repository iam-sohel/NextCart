"use client";

import { Box, Container } from "@mui/material";
import ProductCard from "../products/ProductCard";
import ProductCarousel from "../products/ProductCarousel";
import SectionTitle from "./sectiontitle";
import electronics from "@/data/electronics";

export default function ElectronicsSection() {
  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 2,
          p: 3,
        }}
      >
        <SectionTitle title="💻 Best of Electronics" />

        <ProductCarousel products={electronics} />
        {electronics.map((item) => (
            <ProductCard
              key={item.id}
              image={item.image}
              title={item.title}
              price={item.price}
              offer={item.offer}
            />
          ))}
      </Box>
    </Container>
  );
}