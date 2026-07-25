"use client";

import { Grid } from "@mui/material";
import ProductCard from "./ProductCard";
import products, { Product } from "@/data/products";

export default function ProductGrid() {
  return (
    <Grid container spacing={3}>
      {products.map((product: Product) => (
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