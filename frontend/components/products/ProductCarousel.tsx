"use client";

import { Box } from "@mui/material";
import ProductCard from "./ProductCard";

interface CarouselProduct {
  id: number | string;
  slug: string;
  title: string;
  image: string;
  price: number | string;
  offer?: string;
  discount?: number;
}

interface Props {
  products: CarouselProduct[];
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
  id={product.id}
  slug={product.slug}
  image={product.image}
  title={product.title}
  price={product.price}
  offer={product.offer ?? `${product.discount ?? 0}% OFF`}
/>
        </Box>
      ))}
    </Box>
  );
}