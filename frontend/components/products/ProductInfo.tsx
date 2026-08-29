"use client";

import { Box, Divider, Stack, Typography } from "@mui/material";

import type { Product, ProductVariant } from "@/types/product";
import type { InventoryState } from "@/utils/inventory";

import DeliveryChecker from "./DeliveryChecker";
import ProductActions from "./ProductActions";
import ProductBreadcrumb from "./ProductBreadcrumb";
import ProductDescription from "./ProductDescription";
import ProductPriceBlock from "./ProductPriceBlock";
import ProductRatingRow from "./ProductRatingRow";
import ProductStock from "./ProductStock";
import ProductVariants from "./ProductVariants";
import QuantitySelector from "./QuantitySelector";
import WishlistButton from "./WishlistButton";

interface ProductInfoProps {
  product: Product;
  inventory: InventoryState;
  selectedVariant?: ProductVariant | undefined;
  quantity: number;
  onQuantityChange: (next: number) => void;
  onSelectVariant: (variantId: string | number) => void;
}

/**
 * NEXTCART — ProductInfo
 *
 * The right column of the product details page. This component is a
 * pure composition: it receives the product plus the orchestrator's
 * derived state (selected variant, quantity, inventory) and lays it out
 * in the canonical order:
 *
 *   Brand
 *   Title
 *   Rating
 *   Price block
 *   Variant selector (if any)
 *   Stock indicator
 *   Quantity selector
 *   Action buttons (Add to Cart / Buy Now / Wishlist)
 *   Delivery checker
 *
 * The component does NOT own state for the actions — the parent
 * (ProductDetailsClient) is the single owner.
 */
export default function ProductInfo({
  product,
  inventory,
  selectedVariant,
  quantity,
  onQuantityChange,
  onSelectVariant,
}: ProductInfoProps) {
  const variantExists =
    Array.isArray(product.variants) && product.variants.length > 0;

  const activePrice = selectedVariant?.price ?? product.price;
  const canPurchase = inventory.status !== "out_of_stock";

  const stockLabel =
    inventory.status === "in_stock"
      ? "In stock"
      : inventory.status === "low_stock"
        ? `Only ${inventory.available} left`
        : "Out of stock";

  // Disable Add to Cart when the user hasn't chosen a variant
  // OR when there's no stock.
  const addDisabledReason = !canPurchase
    ? "This product is currently out of stock."
    : variantExists && !selectedVariant
      ? "Choose a variant to continue."
      : undefined;

  return (
    <Box>
      <ProductBreadcrumb product={product} />

      <Typography
        variant="overline"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        {product.brand}
      </Typography>

      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.2 }}
      >
        {product.title}
      </Typography>

      <ProductRatingRow
        rating={product.rating ?? 0}
        reviewCount={product.reviewsCount ?? 0}
      />

      <Box sx={{ mt: 3 }}>
        <ProductPriceBlock
          price={activePrice}
          originalPrice={product.originalPrice}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {variantExists && (
        <ProductVariants
          variants={product.variants!}
          selectedVariantId={selectedVariant?.id}
          onSelect={onSelectVariant}
        />
      )}

      <Box sx={{ mt: 3 }}>
        <ProductStock
          inventory={inventory}
          label={stockLabel}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <QuantitySelector
          value={quantity}
          onChange={onQuantityChange}
          max={inventory.status === "out_of_stock" ? 0 : inventory.available}
          disabled={!canPurchase}
        />
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: "stretch", mt: 3 }}
      >
        <ProductActions
          product={product}
          variantId={selectedVariant?.id}
          variantLabel={selectedVariantLabel(selectedVariant)}
          quantity={quantity}
          priceOverride={selectedVariant?.price}
          canPurchase={
            canPurchase && (!variantExists || Boolean(selectedVariant))
          }
          addDisabledReason={addDisabledReason}
        />

        <WishlistButton productId={product.id} />
      </Stack>

      <DeliveryChecker productId={product.id} />

      <ProductDescription
        description={product.description}
        highlights={product.highlights}
      />
    </Box>
  );
}

function selectedVariantLabel(
  variant: ProductVariant | undefined,
): string | undefined {
  if (!variant) return undefined;

  const parts: string[] = [];

  if (variant.color) parts.push(String(variant.color));
  if (variant.size) parts.push(String(variant.size));
  if (variant.storage) parts.push(String(variant.storage));

  return parts.length > 0 ? parts.join(" · ") : undefined;
}