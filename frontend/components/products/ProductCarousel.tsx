"use client";

import { Box } from "@mui/material";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export default function ProductCarousel({ products }: Props) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        display: "flex",
        gap: { xs: 1.5, sm: 2, md: 3 },
        overflowX: "auto",
        pb: { xs: 1, sm: 2 },
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {products.map((product) => (
        <Box
          key={product.id}
          sx={{
            minWidth: { xs: 205, sm: 240, md: 280 },
            flexShrink: 0,
          }}
        >
          <ProductCard
            id={product.id}
            slug={product.slug}
            image={product.image}
            title={product.title}
            price={product.price}
            originalPrice={product.originalPrice}
            offer={
              product.discount && product.discount > 0
                ? `${product.discount}% OFF`
                : "Best Price"
            }
            rating={product.rating}
            brand={product.brand}
            bestseller={product.bestseller}
            newArrival={product.newArrival}
          />
        </Box>
      ))}
    </Box>
  );
}