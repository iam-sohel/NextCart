import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailsClient from "@/components/products/ProductDetailsClient";

import {
  getProductBySlug,
  listProducts,
  getProductDetailsById,
} from "@/services/productService";
import { normalizeProduct } from "@/utils/normalizeProduct";
import type { Product } from "@/types/product";

/**
 * NEXTCART — Product details page (Server Component)
 *
 * Route: /products/[slug]
 *
 * In Next.js 16, `params` is a Promise that must be awaited. AGENTS.md
 * flags that this version of Next differs from prior training data —
 * the prop signature below is intentional.
 *
 * Data flow:
 *   1. Resolve the slug against the live Spring Boot catalogue.
 *      If the backend is reachable we then load the matching
 *      `ProductDetailsResponse` (images, variants, specs, info).
 *   2. If the backend is unavailable, we fall back to the in-house
 *      mock catalogue so the page still renders (development-friendly).
 *   3. If neither source knows the slug, `notFound()` triggers the
 *      segment-level 404 page.
 *
 * The Product* UI components (ProductGallery, ProductInfo,
 * ProductActions, ProductVariants, ProductSpecifications,
 * ProductReviews, ProductBreadcrumb, RelatedProducts) are
 * untouched — they receive the same Product shape as before.
 */
export default async function ProductDetailsPage(
  props: PageProps<"/products/[slug]">,
) {
  const { slug } = await props.params;

  const lookup = await getProductBySlug(slug, { useMockFallback: true });

  if (!lookup.ok) {
    notFound();
  }

  const product = lookup.data;

  // Related products: up to 4 products in the same category,
  // excluding the current product. The backend does not yet expose a
  // dedicated /related endpoint so we use the same-category subset of
  // the catalogue.
  const catalogue = await listProducts({ useMockFallback: true });

  const relatedSource =
    catalogue.source === "error" ? [] : catalogue.products;

  const related = relatedSource
    .filter(
      (p) =>
        p.category &&
        product.category &&
        p.category === product.category &&
        String(p.id) !== String(product.id),
    )
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 4)
    .map((p) => normalizeProduct(p as Product));

  return (
    <>
      <Header />

      <ProductDetailsClient product={product} related={related} />

      <Footer />
    </>
  );
}

/**
 * `getProductDetailsById` is re-exported here so other server modules
 * (e.g. route segment config) can import it without a separate deep
 * import path. Not used by the page above, but kept available for
 * future server-rendered pre-rendering of the details payload.
 */
export { getProductDetailsById };
