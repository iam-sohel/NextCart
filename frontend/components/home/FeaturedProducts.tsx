"use client";

import { Container, Typography, Grid } from "@mui/material";

import ProductCard from "@/components/products/ProductCard";
import { getProductImage } from "@/utils/productImages";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

/**
 * Featured Products strip. Receives a pre-filtered subset of the
 * backend catalogue (`featured === true`) from the home page. The
 * section preserves the original card grid visual exactly.
 */
export default function FeaturedProducts({ products }: Props) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 4,
        }}
      >
        ⭐ Featured Products
      </Typography>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid
            key={product.id}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <ProductCard
              id={product.id}
              slug={product.slug}
              image={getProductImage(product)}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              offer={
                product.discount ? `${product.discount}% OFF` : "Best Price"
              }
              rating={product.rating}
              brand={product.brand}
              bestseller={product.bestseller}
              newArrival={product.newArrival}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
