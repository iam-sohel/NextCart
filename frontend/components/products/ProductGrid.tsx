import { Grid } from "@mui/material";

import ProductCard from "./ProductCard";
import {
  enrichProductListWithDetails,
  listProducts,
} from "@/services/productService";
import { getProductImage } from "@/utils/productImages";
import type { Product } from "@/types/product";

/**
 * NEXTCART — ProductGrid (Server Component).
 *
 * Renders the full product catalogue. The grid deliberately goes
 * through the service layer (not a direct product import) so
 * the data source can be swapped without touching the rendering code.
 *
 * Data flow:
 *   1. `listProducts()` hits the Spring Boot catalogue endpoint.
 *      - If the backend is reachable we receive the live list of
 *        `ProductResponse` payloads.
 *      - If the backend is unreachable, the grid renders empty — there
 *        is no mock fallback.
 *   2. `enrichProductListWithDetails()` issues a follow-up
 *      `GET /api/v1/products/{id}/details` for each product in small
 *      parallel batches to upgrade it with images, variants,
 *      specifications and information. Failures on individual details
 *      calls keep the original product in place (graceful degradation).
 *
 * The product card visual design is preserved — only the data layer
 * changed.
 */
export default async function ProductGrid() {
  const list = await listProducts();

  const products: Product[] =
    list.source === "error" ? [] : list.products;

  const enriched = await enrichProductListWithDetails(products, {
    loadInventory: false,
  });

  return (
    <Grid container spacing={3}>
      {enriched.map((product) => {
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
