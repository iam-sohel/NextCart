"use client";

import { Container, Typography, Grid } from "@mui/material";

import ProductCard from "@/components/products/ProductCard";
import products from "@/data/products";

export default function FeaturedProducts() {
  const featuredProducts = products.filter(
    (product) => product.featured
  );

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
        {featuredProducts.map((product) => (
          <Grid
            key={product.id}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <ProductCard
              id={product.id}
              slug={product.slug}
              image={product.image}
              title={product.title}
              price={product.price}
              offer={
                product.discount ? `${product.discount}% OFF` : "Best Price"
              }
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}