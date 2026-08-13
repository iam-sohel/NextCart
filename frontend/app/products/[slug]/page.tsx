import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailsClient from "@/components/products/ProductDetailsClient";

import {
  getMockProductBySlug,
  listMockProducts,
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
 * Today this page renders from the local mock dataset. Once the Spring
 * Boot backend exposes GET /api/products/{slug} we will swap the data
 * source to `getProductBySlug(slug)` from the service layer.
 */
export default async function ProductDetailsPage(
  props: PageProps<"/products/[slug]">,
) {
  const { slug } = await props.params;

  const raw = getMockProductBySlug(slug);
  if (!raw) notFound();

  const product = normalizeProduct(raw);

  // Related products = up to 4 products in the same category, excluding
  // the current one. Sorted to keep results stable.
  const related = listMockProducts()
    .filter(
      (p) =>
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
