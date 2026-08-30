import { Box, Typography, Container } from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryBar from "@/components/home/CategoryBar";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import DealsSection from "@/components/home/DealsSection";
import ElectronicsSection from "@/components/home/ElectronicsSection";
import FashionSection from "@/components/home/FashionSection";
import Newsletter from "@/components/home/Newsletter";

import { listProducts, enrichProductListWithDetails } from "@/services/productService";
import type { Product } from "@/types/product";

/**
 * NEXTCART — Home page (Server Component).
 *
 * Backend is the single source of truth for product data.
 *
 * The full catalogue is fetched once via `listProducts()` (which hits
 * `GET /api/v1/products`). The catalogue is then split into
 * section-shaped subsets:
 *
 *   - Hero            → first product with a discount
 *   - Featured        → products flagged `featured`
 *   - Deals           → products with a non-zero discount
 *   - Electronics     → products in "Mobiles" / "Laptops" / "Tablets"
 *                       / "Audio" / "Televisions" / "Gaming"
 *   - Fashion         → products in "Men's Fashion" / "Women's
 *                       Fashion" / "Footwear"
 *
 * If the backend is unreachable, the page renders an inline message
 * and the non-product sections (header, footer, newsletter, etc.)
 * still load.
 */
export default async function HomePage() {
  const result = await listProducts();

  let allProducts: Product[] =
    result.source === "backend" ? result.products : [];

  if (allProducts.length > 0) {
    allProducts = await enrichProductListWithDetails(allProducts, {
      loadInventory: false,
    });
  }

  const hasProducts = allProducts.length > 0;

  /* ----------------------------- Hero subset ---------------------------- */

  const heroProduct =
    allProducts.find(
      (product) =>
        typeof product.discount === "number" &&
        product.discount > 0,
    ) ?? allProducts[0];

  /* --------------------------- Featured subset -------------------------- */

  const featuredProducts = allProducts
    .filter((product) => product.featured)
    .slice(0, 8);

  /* ----------------------------- Deals subset --------------------------- */

  const dealProducts = allProducts
    .filter(
      (product) =>
        typeof product.discount === "number" &&
        product.discount > 0,
    )
    .slice(0, 8)
    .map((product) => ({
      ...product,
      offer: product.discount
        ? `${product.discount}% OFF`
        : "Best Price",
    }));

  /* ------------------------ Electronics subset -------------------------- */

  const ELECTRONICS_CATEGORIES = new Set([
    "Mobiles",
    "Laptops",
    "Tablets",
    "Audio",
    "Televisions",
    "Gaming",
  ]);

  const electronicsProducts = allProducts
    .filter((product) =>
      ELECTRONICS_CATEGORIES.has(product.category),
    )
    .slice(0, 8);

  /* -------------------------- Fashion subset ---------------------------- */

  const FASHION_CATEGORIES = new Set([
    "Men's Fashion",
    "Women's Fashion",
    "Footwear",
  ]);

  const fashionProducts = allProducts
    .filter((product) =>
      FASHION_CATEGORIES.has(product.category),
    )
    .slice(0, 8);

  return (
    <>
      <Header />

      <Box
        sx={{
          bgcolor: "#f5f5f5",
          pb: 4,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {/* Categories */}
        <Box
          sx={{
            pt: 3,
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <CategoryBar />
        </Box>

        {/* Banner — only renders a real product when the backend
            provided one; otherwise an empty banner. */}
        {heroProduct ? (
          <Hero product={heroProduct} />
        ) : null}

        {/* Homepage sections */}
        {hasProducts ? (
          <>
            <FeaturedProducts products={featuredProducts} />
            <DealsSection products={dealProducts} />
            <ElectronicsSection products={electronicsProducts} />
            <FashionSection products={fashionProducts} />
          </>
        ) : (
          <Container maxWidth="xl" sx={{ py: 6 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Products are temporarily unavailable
            </Typography>
            <Typography color="text.secondary">
              We could not reach the product catalogue. Please
              try again in a moment.
            </Typography>
          </Container>
        )}

        <Newsletter />
      </Box>

      <Footer />
    </>
  );
}
