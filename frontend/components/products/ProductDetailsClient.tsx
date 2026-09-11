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
 * section components.
 *
 * Layout model (matches Amazon/Flipkart-style product pages):
 *
 *   Desktop (md+):                    Mobile (xs–sm):
 *   ┌──────────────┬─────────────┐    ┌─────────────┐
 *   │              │  Info card  │    │   Gallery    │
 *   │   Gallery    │  (sticky,   │    ├─────────────┤
 *   │   (sticky)   │   scrolls   │    │  Info card   │
 *   │              │   with      │    ├─────────────┤
 *   │              │   content)  │    │  Sections    │
 *   └──────────────┴─────────────┘    └─────────────┘
 *
 *   Below the fold: Specifications → Reviews → Related products.
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
  // (or the product-level inventory if no variant is chosen). When the
  // backend attaches a `stockStatus` enum (IN_STOCK / LOW_STOCK /
  // OUT_OF_STOCK) it takes precedence over the local threshold-based
  // derivation.
  const inventory: InventoryState = useMemo(() => {
    if (selectedVariant?.inventory || selectedVariant?.stockStatus) {
      return deriveInventory({
        ...(selectedVariant?.inventory ?? {}),
        stockStatus: selectedVariant?.stockStatus,
      });
    }
    if (product.inventory || product.stockStatus) {
      return deriveInventory({
        ...(product.inventory ?? {}),
        stockStatus: product.stockStatus,
      });
    }
    return deriveInventory(product.stock ?? 0);
  }, [
    selectedVariant,
    product.inventory,
    product.stock,
    product.stockStatus,
  ]);

  // Quantity is clamped to the available stock on every render so
  // changing the variant (which changes `inventory`) never requires an
  // effect-driven setState cascade. We only store the user-intended
  // value; the displayed / submitted value is derived.
  const [requestedQuantity, setQuantity] = useState<number>(1);
  const quantity = clampQuantityToInventory(requestedQuantity, inventory);

  return (
    <Box
      component="main"
      sx={{ bgcolor: "background.default", minHeight: "60vh" }}
    >
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, md: 3 } }}>
        {/* ── Main product area ─────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 2, md: 3 },
            overflow: "hidden",
            mt: { xs: 1.5, md: 3 },
          }}
        >
          <Grid
            container
            spacing={0}
            sx={{
              alignItems: "flex-start",
              px: { xs: 1.5, sm: 2.5, md: 4 },
              py: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {/* Gallery column — sticky on desktop so the thumbnails
                stay visible while the (long) info column scrolls. */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                minWidth: 0, // allows the grid child to shrink below content width (no overflow)
              }}
            >
              <Box
                sx={{
                  position: { md: "sticky" },
                  top: { md: 96 },
                }}
              >
                <ProductGallery title={product.title} images={product.images} />
              </Box>
            </Grid>

            {/* Info column. */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
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
        </Box>

        {/* ── Below-the-fold sections span the full width ──────────── */}
        <ProductSpecifications specifications={product.specifications} />

        <ProductReviews
          reviews={product.reviewsList ?? []}
          summary={
            product.reviewsSummary ?? {
              average: product.rating ?? 0,
              count: product.reviewsCount,
            }
          }
        />

        <RelatedProducts related={related} />
      </Container>
    </Box>
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
