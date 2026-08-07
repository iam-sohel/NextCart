"use client";

import { Box, Typography, Button } from "@mui/material";
import ProductCard from "@/components/products/ProductCard";

interface Product {
  id: number;
  slug: string;
  title: string;
  image: string;
  price: string;
  offer: string;
  rating?: number;
  brand?: string;
}

interface ProductRowProps {
  title: string;
  products: Product[];
}

export default function ProductRow({
  title,
  products,
}: ProductRowProps) {
  return (
    <Box sx={{ mt: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Button variant="contained">
          View All
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2,1fr)",
            sm: "repeat(3,1fr)",
            md: "repeat(4,1fr)",
            lg: "repeat(5,1fr)",
          },
          gap: 3,
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            slug={product.slug}
            image={product.image}
            title={product.title}
            price={product.price}
            offer={product.offer}
            rating={product.rating}
            brand={product.brand}
          />
        ))}
      </Box>
    </Box>
  );
}