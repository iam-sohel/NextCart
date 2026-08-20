"use client";

import { Grid } from "@mui/material";
import ProductCard from "./ProductCard";
import { listMockProducts } from "@/services/productService";
import { getProductImage } from "@/utils/productImages";

/**
 * Renders the full product catalogue. The grid deliberately goes through
 * the service layer (not a direct `data/products` import) so that when the
 * Spring Boot backend exposes GET /api/products we can swap the data
 * source to `fetchProducts()` without touching this file.
 */
export default function ProductGrid() {
  const products = listMockProducts();

  return (
    <Grid container spacing={3}>
      {products.map((product) => {
        const image = getProductImage(product);
        const offer =
          product.discount && product.discount > 0
            ? `${product.discount}% OFF`
            : "Best Price";

        return (
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
              image={image}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              offer={offer}
              rating={product.rating}
              reviews={product.reviews}
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