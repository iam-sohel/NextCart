"use client";

import { useMemo, useState } from "react";

import { Box, Container, Grid } from "@mui/material";

import type { Product, ProductVariant } from "@/types/product";
import {
  deriveInventory,
  type InventoryState,
} from "@/utils/inventory";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductReviews from "./ProductReviews";
import ProductSpecifications from "./ProductSpecifications";
import RelatedProducts from "./RelatedProducts";

interface ProductDetailsClientProps {
  product: Product;
  related?: Product[];
}

/**
 * NEXTCART — ProductDetailsClient
 *
 * The interactive orchestrator for the product details page. Owns all
 * client-only state (selected variant, quantity) and composes the
 * section components in the canonical mobile-first order:
 *
 *   Gallery
 *   Info (breadcrumb, brand, title, rating, price, variants, stock,
 *         quantity, actions, delivery, description)
 *   Specifications
 *   Reviews
 *   Related products
 *
 * Server / data responsibilities:
 *   - The parent server component (app/products/[slug]/page.tsx)
 *     supplies the Product. Future backend integration is the parent's
 *     job; this component continues to render whatever it receives.
 *
 * State model:
 *   - selectedVariantId stays undefined until the user picks one. Add to
 *     Cart is disabled in that state when variants exist.
 *   - The displayed inventory is variant-level when a variant is picked,
 *     otherwise it falls back to the product-level inventory.
 *   - Quantity is clamped to the current inventory ceiling.
 */
export default function ProductDetailsClient({
  product,
  related = [],
}: ProductDetailsClientProps) {
  const variantList = useMemo<ProductVariant[]>(
    () => product.variants ?? [],
    [product.variants],
  );

  const [selectedVariantId, setSelectedVariantId] = useState<
    string | number | undefined
  >(variantList[0]?.id);

  const selectedVariant = useMemo<ProductVariant | undefined>(() => {
    if (selectedVariantId === undefined) return undefined;
    return variantList.find(
      (v) => String(v.id) === String(selectedVariantId),
    );
  }, [variantList, selectedVariantId]);

  // Compute the effective inventory for the currently-selected variant
  // (or the product-level inventory if no variant is chosen).
  const inventory: InventoryState = useMemo(() => {
    if (selectedVariant?.inventory) {
      return deriveInventory(selectedVariant.inventory);
    }
    return deriveInventory(product.inventory ?? product.stock ?? 0);
  }, [selectedVariant, product.inventory, product.stock]);

  // Quantity is clamped to the available stock on every render so
  // changing the variant (which changes `inventory`) never requires an
  // effect-driven setState cascade. We only store the user-intended
  // value; the displayed / submitted value is derived.
  const [requestedQuantity, setQuantity] = useState<number>(1);
  const quantity = clampQuantityToInventory(requestedQuantity, inventory);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Grid container spacing={{ xs: 3, md: 5 }}>
        {/* Gallery column. On mobile the gallery stacks first per the
            recommended mobile order. */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ProductGallery title={product.title} images={product.images} />
        </Grid>

        {/* Info column. */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ProductInfo
            product={product}
            inventory={inventory}
            selectedVariant={selectedVariant}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onSelectVariant={setSelectedVariantId}
          />
        </Grid>
      </Grid>

      {/* Below-the-fold sections span the full width. */}
      <Box sx={{ mt: { xs: 2, md: 4 } }}>
        <ProductSpecifications specifications={product.specifications} />
      </Box>

      <Box>
        <ProductReviews
          reviews={product.reviewsList ?? []}
          summary={
            product.reviewsSummary ?? {
              average: product.rating,
              count: product.reviews,
            }
          }
        />
      </Box>

      <Box>
        <RelatedProducts related={related} />
      </Box>
    </Container>
  );
}

/**
 * Clamp the user-entered quantity against the current inventory ceiling.
 * Keeping this as a pure function lets the orchestrator derive the
 * effective quantity on every render — no effect-driven setState.
 */
function clampQuantityToInventory(
  requested: number,
  inventory: InventoryState,
): number {
  if (inventory.status === "out_of_stock") return 1;
  const max = inventory.available;
  if (!Number.isFinite(requested) || requested < 1) return 1;
  if (requested > max) return max;
  return requested;
}
