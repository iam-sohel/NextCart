"use client";

import { usePathname, useRouter } from "next/navigation";
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
import useAuthStore from "@/store/authStore";
import type { Product } from "@/types/product";

const loginRedirect = (returnTo: string) =>
  `/login?reason=login-required&return=${encodeURIComponent(returnTo)}`;

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
  /** Optional user-facing success message from the parent. */
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
  onAfterAdd,
  fullWidth = true,
}: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const pathname = usePathname();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    // The cart API is authenticated; send guests to login first.
    if (!token) {
      router.push(loginRedirect(pathname || `/products/${product.slug}`));
      return;
    }

    setSubmitting(true);

    const result = await addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: priceOverride ?? product.price,
      quantity,
      variantId,
      variantLabel,
    });

    setSubmitting(false);

    if (result.ok) {
      onAfterAdd?.();
    } else {
      setError(result.message);
    }
  };

  const busy = submitting || loading;
  const label = busy ? "Adding…" : "Add to cart";

  return (
    <Box sx={{ width: fullWidth ? "100%" : undefined }}>
      <Button
        variant="contained"
        size="large"
        onClick={handleClick}
        disabled={disabled || busy}
        fullWidth={fullWidth}
        startIcon={
          busy ? <CircularProgress size={16} color="inherit" /> : undefined
        }
        sx={{ fontWeight: 700 }}
      >
        {label}
      </Button>

      {error ? (
        <Alert severity="error" sx={{ mt: 1.5, py: 0.5 }}>
          {error}
        </Alert>
      ) : (
        feedback?.type === "success" && (
          <Alert severity="success" sx={{ mt: 1.5, py: 0.5 }}>
            {feedback.message}
          </Alert>
        )
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
  const token = useAuthStore((state) => state.token);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    if (!token) {
      router.push(loginRedirect("/checkout"));
      return;
    }

    setSubmitting(true);

    const result = await addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: priceOverride ?? product.price,
      quantity,
      variantId,
      variantLabel,
    });

    setSubmitting(false);

    // Never advance to checkout unless the item actually made it into the
    // server cart — the backend builds the order from the cart contents.
    if (result.ok) {
      router.push("/checkout");
    } else {
      setError(result.message);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        onClick={handleClick}
        disabled={disabled || submitting}
        startIcon={
          submitting ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <BoltIcon />
          )
        }
        sx={{ fontWeight: 700 }}
        fullWidth
      >
        {submitting ? "Processing…" : "Buy now"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 1.5, py: 0.5 }}>
          {error}
        </Alert>
      )}
    </Box>
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