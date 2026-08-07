"use client";

import { Grid } from "@mui/material";
import ProductCard from "./ProductCard";
import products from "@/data/products";

export default function ProductGrid() {
  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid
          key={product.id}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        >
          <ProductCard
  id={product.id}
  slug={product.slug}
            image={product.image}
            title={product.title}
            price={`₹${product.price.toLocaleString()}`}
            offer={`${product.discount}% OFF`}
            rating={product.rating}
            brand={product.brand}
          />
        </Grid>
      ))}
    </Grid>
  );
}