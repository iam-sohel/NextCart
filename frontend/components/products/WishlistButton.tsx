"use client";

import { useState } from "react";

import { IconButton, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import useWishlistStore from "@/store/wishlistStore";

interface WishlistButtonProps {
  productId: number | string;
  title: string;
  image: string;
  slug: string;
  price: number;
  originalPrice?: number;
  brand?: string;
  /** Compact pill style for the price row; defaults to icon-only. */
  variant?: "icon" | "compact";
}

/**
 * NEXTCART — WishlistButton
 *
 * Single source of truth for "toggle this product in the wishlist" used
 * in:
 *   - Product details page (next to Add to Cart)
 *   - ProductCard (top-right corner overlay)
 *   - Future: cart line items ("save for later")
 *
 * Behaviour:
 *   - Toggles through the existing wishlistStore. Never duplicates state.
 *   - Always reads the latest isInWishlist() result so the heart icon
 *     updates the moment a related event changes the store.
 *   - aria-pressed reflects the current state.
 */
export default function WishlistButton({
  productId,
  title,
  image,
  slug,
  price,
  originalPrice,
  brand,
  variant = "icon",
}: WishlistButtonProps) {
  const [hovered, setHovered] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlistStore();

  const numericId = toNumericId(productId);
  const liked = numericId !== null && isInWishlist(numericId);

  const handleClick = () => {
    if (numericId === null) return;
    if (liked) {
      removeFromWishlist(numericId);
    } else {
      addToWishlist({
        id: numericId,
        title,
        image,
        price,
        slug,
        brand,
        originalPrice,
      });
    }
  };

  const label = liked ? "Remove from wishlist" : "Add to wishlist";
  const showFilled = liked || (hovered && !liked);

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        aria-pressed={liked}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        color={liked ? "error" : "default"}
        sx={
          variant === "icon"
            ? {
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 999,
                width: 44,
                height: 44,
              }
            : undefined
        }
      >
        {showFilled ? (
          <FavoriteIcon sx={{ color: liked ? "error.main" : "text.primary" }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: "text.primary" }} />
        )}
      </IconButton>
    </Tooltip>
  );
}

/**
 * Coerce a `Product.id` (`number | string`) into the numeric id the
 * wishlist store expects. Returns null for non-numeric values (e.g. a
 * future UUID-based product id) — the button treats that case as a
 * non-actionable target so we never poison the store.
 */
function toNumericId(id: number | string): number | null {
  if (typeof id === "number") return id;
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : null;
}
