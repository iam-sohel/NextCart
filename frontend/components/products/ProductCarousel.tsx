"use client";

import { Box } from "@mui/material";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export default function ProductCarousel({ products }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        overflowX: "auto",
        pb: 2,
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {products.map((product) => (
        <Box
          key={product.id}
          sx={{
            minWidth: 280,
            flexShrink: 0,
          }}
        >
          <ProductCard
            slug={product.slug}
            image={product.image}
            title={product.title}
            price={`₹${product.price.toLocaleString()}`}
            offer={`${product.discount}% OFF`}
          />
        </Box>
      ))}
    </Box>
  );
}