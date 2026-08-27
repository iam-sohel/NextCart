"use client";

import Link from "next/link";

import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";

interface RelatedProductsProps {
  related: Product[];
}

/**
 * NEXTCART — RelatedProducts
 *
 * Lists products related to the current one (e.g. same category, "you
 * may also like") by reusing the existing <ProductCard /> component.
 *
 * Why we reuse ProductCard:
 *   - Single source of truth for the product card visual + behaviour.
 *   - New card features automatically apply here.
 *   - Future enhancements (live price from API, percentage discount,
 *     badges) need to change only one place.
 *
 * Empty state:
 *   - When there are no related products we surface a "no
 *     recommendations" placeholder rather than rendering an empty
 *   section, so the user isn't left wondering whether the page is
 *   broken.
 */
export default function RelatedProducts({ related }: RelatedProductsProps) {
  if (related.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          No related products yet
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 3 }}
        >
          Browse our full catalogue for more options.
        </Typography>
        <Button component={Link} href="/products" variant="contained">
          Browse all products
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 5 }} aria-labelledby="related-products-heading">
      <Typography
        id="related-products-heading"
        variant="h5"
        sx={{ fontWeight: 700, mb: 3 }}
      >
        You may also like
      </Typography>

      <Grid container spacing={3}>
        {related.map((product) => (
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
    </Box>
  );
}
