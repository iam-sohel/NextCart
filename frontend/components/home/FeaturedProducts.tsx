"use client";

import { Container, Typography, Grid } from "@mui/material";

import ProductCard from "@/components/products/ProductCard";
import { listMockProducts } from "@/services/productService";
import { getProductImage } from "@/utils/productImages";

export default function FeaturedProducts() {
  const featuredProducts = listMockProducts().filter(
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
              image={getProductImage(product)}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              offer={
                product.discount ? `${product.discount}% OFF` : "Best Price"
              }
              rating={product.rating}
              reviews={product.reviews}
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