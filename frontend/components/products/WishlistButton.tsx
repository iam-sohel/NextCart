"use client";

import { useState } from "react";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";

import useAuthStore from "@/store/authStore";
import useWishlistStore from "@/store/wishlistStore";

interface WishlistButtonProps {
  productId: number | string;
  variant?: "icon" | "compact";
}

export default function WishlistButton({
  productId,
  variant = "icon",
}: WishlistButtonProps) {
  const [hovered, setHovered] = useState(false);

  const router = useRouter();

  const token = useAuthStore((state) => state.token);

  const has = useWishlistStore((state) => state.has);
  const add = useWishlistStore((state) => state.add);
  const remove = useWishlistStore((state) => state.remove);

  const liked = has(productId);

  const handleClick = () => {
    if (!token) {
      router.push("/login?reason=login-required&return=/wishlist");
      return;
    }

    if (liked) {
      void remove(productId);
    } else {
      void add(productId);
    }
  };

  const label = liked
    ? "Remove from wishlist"
    : "Add to wishlist";

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
          <FavoriteIcon
            sx={{
              color: liked ? "error.main" : "text.primary",
            }}
          />
        ) : (
          <FavoriteBorderIcon
            sx={{
              color: "text.primary",
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
}