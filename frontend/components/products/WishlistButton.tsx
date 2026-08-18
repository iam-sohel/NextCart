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
  /**
   * Optional variant for the wishlist line. When the user picked a
   * specific variant on the product details page we save that variant
   * alongside the product so "Move to cart" later preserves it.
   */
  variantId?: string | number;
  variantLabel?: string;
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
  variantId,
  variantLabel,
  variant = "icon",
}: WishlistButtonProps) {
  const [hovered, setHovered] = useState(false);
  const { addToWishlist, removeFromWishlistLine, isInWishlist } =
    useWishlistStore();

  const liked = isInWishlist(productId, { variantId });

  const handleClick = () => {
    if (liked) {
      removeFromWishlistLine(productId, { variantId });
    } else {
      addToWishlist({
        id: productId,
        title,
        image,
        price,
        slug,
        brand,
        originalPrice,
        variantId,
        variantLabel,
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
 * NOTE: Previously this file coerced ids through `toNumericId` before
 * passing them to the store. The store now accepts the polymorphic
 * `id: number | string` shape directly, so the helper is gone.
