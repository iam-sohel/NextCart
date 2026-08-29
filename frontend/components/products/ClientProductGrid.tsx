"use client";

import { Grid } from "@mui/material";

import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";

interface ClientProductGridProps {
  products: Product[];
}

export default function ClientProductGrid({ products }: ClientProductGridProps) {
  return (
    <Grid container spacing={3}>
      {products.map((product) => {
        const image = product.image;
        const offer =
          product.discount && product.discount > 0
            ? `${product.discount}% OFF`
            : "Best Price";

        return (
          <Grid
            key={product.id}
            size={{
              xs: 6,
              sm: 6,
              md: 4,
              lg: 3,
            }}
          >
            <ProductCard
              id={product.id}
              slug={product.slug}
              image={image}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              offer={offer}
              rating={product.rating}
              brand={product.brand}
              bestseller={product.bestseller}
              newArrival={product.newArrival}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}