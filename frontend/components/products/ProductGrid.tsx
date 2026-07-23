"use client";

import Grid from "@mui/material/Grid";
import ProductCard from "./ProductCard";
import products from "@/data/products";

export default function ProductGrid() {
  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid
          key={product.id}
          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
        >
          <ProductCard
            image={product.image}
            title={product.title}
            price={`₹${product.price.toLocaleString()}`}
            offer={`${product.discount}% OFF`}
          />
        </Grid>
      ))}
    </Grid>
  );
}