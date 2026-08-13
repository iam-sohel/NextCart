"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";

import useCartStore from "@/store/cartStore";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  variantId?: string | number;
  variantLabel?: string | undefined;
  quantity: number;
  /**
   * Override the price used for the cart line. Used when the selected
   * variant has its own price override.
   */
  priceOverride?: number;
  disabled?: boolean;
  /** True when the Add to Cart action is preparing (e.g. validating). */
  loading?: boolean;
  /** Optional user-facing message (success/error). */
  feedback?: { type: "success" | "error"; message: string } | null;
  onAfterAdd?: () => void;
  fullWidth?: boolean;
}

export function AddToCartButton({
  product,
  variantId,
  variantLabel,
  quantity,
  priceOverride,
  disabled,
  loading,
  feedback,
  fullWidth = true,
}: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleClick = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: priceOverride ?? product.price,
      quantity,
      variantId,
      variantLabel,
    });
  };

  const label =
    loading || feedback?.type === "error" ? "Adding…" : "Add to cart";

  return (
    <Box sx={{ width: fullWidth ? "100%" : undefined }}>
      <Button
        variant="contained"
        size="large"
        onClick={handleClick}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        startIcon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : undefined
        }
        sx={{ fontWeight: 700 }}
      >
        {label}
      </Button>

      {feedback && feedback.type === "success" && (
        <Alert severity="success" sx={{ mt: 1.5, py: 0.5 }}>
          {feedback.message}
        </Alert>
      )}
    </Box>
  );
}

interface BuyNowButtonProps {
  product: Product;
  variantId?: string | number;
  variantLabel?: string | undefined;
  quantity: number;
  priceOverride?: number;
  disabled?: boolean;
}

export function BuyNowButton({
  product,
  variantId,
  variantLabel,
  quantity,
  priceOverride,
  disabled,
}: BuyNowButtonProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleClick = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: priceOverride ?? product.price,
      quantity,
      variantId,
      variantLabel,
    });
    router.push("/checkout");
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      size="large"
      onClick={handleClick}
      disabled={disabled}
      startIcon={<BoltIcon />}
      sx={{ fontWeight: 700 }}
      fullWidth
    >
      Buy now
    </Button>
  );
}

interface ProductActionsProps {
  product: Product;
  variantId?: string | number;
  variantLabel?: string | undefined;
  quantity: number;
  priceOverride?: number;
  canPurchase: boolean;
  addDisabledReason?: string;
  onAfterAdd?: () => void;
}

export default function ProductActions({
  product,
  variantId,
  variantLabel,
  quantity,
  priceOverride,
  canPurchase,
  addDisabledReason,
  onAfterAdd,
}: ProductActionsProps) {
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const handleAdded = () => {
    setFeedback({
      type: "success",
      message: `Added ${quantity} × ${product.title} to cart`,
    });
    onAfterAdd?.();
  };

  return (
    <Stack
      spacing={2}
      sx={{ mt: 4 }}
      aria-label="Purchase actions"
    >
      {addDisabledReason && !canPurchase && (
        <Alert severity="warning" sx={{ alignItems: "center" }}>
          {addDisabledReason}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
      >
        <AddToCartButton
          product={product}
          variantId={variantId}
          variantLabel={variantLabel}
          quantity={quantity}
          priceOverride={priceOverride}
          disabled={!canPurchase}
          feedback={feedback}
          onAfterAdd={handleAdded}
        />
        <BuyNowButton
          product={product}
          variantId={variantId}
          variantLabel={variantLabel}
          quantity={quantity}
          priceOverride={priceOverride}
          disabled={!canPurchase}
        />
      </Stack>
    </Stack>
  );
}
