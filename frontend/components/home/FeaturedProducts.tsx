"use client";

import { Box, Container, Grid } from "@mui/material";

import ProductCard from "@/components/products/ProductCard";
import SectionTitle from "./sectiontitle";
import { getProductImage } from "@/utils/productImages";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

/**
 * Featured Products strip. Receives a pre-filtered subset of the
 * backend catalogue (`featured === true`) from the home page.
 *
 * Presentation only: clean white surface, shared section heading, and
 * the existing responsive product grid (2-up on mobile preserved).
 */
export default function FeaturedProducts({ products }: Props) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, md: 1.5 } }}>
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: { xs: 1.5, sm: 2, md: 3 },
          boxShadow: 1,
        }}
      >
        <SectionTitle title="⭐ Featured Products" />

        <Grid
          container
          spacing={{ xs: 1.5, sm: 2, md: 3 }}
        >
          {products.map((product) => (
            <Grid
              key={product.id}
              size={{ xs: 6, sm: 6, md: 3 }}
            >
              <ProductCard
                id={product.id}
                slug={product.slug}
                image={getProductImage(product)}
                title={product.title}
                price={product.price}
                originalPrice={product.originalPrice}
                offer={
                  product.discount
                    ? `${product.discount}% OFF`
                    : "Best Price"
                }
                rating={product.rating}
                brand={product.brand}
                bestseller={product.bestseller}
                newArrival={product.newArrival}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
