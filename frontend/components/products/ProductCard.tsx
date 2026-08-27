"use client";

import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
} from "@mui/material";

import StarIcon from "@mui/icons-material/Star";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

import useWishlistStore from "@/store/wishlistStore";
import useAuthStore from "@/store/authStore";

const UNIVERSAL_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F3F1EC'/%3E%3Cpath d='M120 280l55-65 40 45 30-35 55 55H120z' fill='%23c8c3b8'/%3E%3Ccircle cx='255' cy='145' r='25' fill='%23c8c3b8'/%3E%3C/svg%3E";

interface ProductCardProps {
  id: number | string;
  slug: string;
  image: string;
  title: string;
  price: number | string;
  originalPrice?: number | string;
  offer: string;
  rating?: number;
  reviews?: number;
  brand?: string;
  bestseller?: boolean;
  newArrival?: boolean;
}

/**
 * Deterministic price formatter.
 *
 * Explicitly uses the Indian locale so the server and browser
 * produce the same result during hydration.
 *
 * Example:
 * 119999 -> 1,19,999
 */
const formatPrice = (value: number | string): string => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(amount);
};

const formatReviews = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
};

export default function ProductCard({
  id,
  slug,
  image,
  title,
  price,
  originalPrice,
  offer,
  rating = 4.5,
  reviews = 0,
  brand = "NextCart",
  bestseller = false,
  newArrival = false,
}: ProductCardProps) {
  const [resolvedImage, setResolvedImage] = useState<string>(image);

  const router = useRouter();

  const token = useAuthStore((state) => state.token);

  const has = useWishlistStore((state) => state.has);
  const addToWishlistAction = useWishlistStore((state) => state.add);
  const removeFromWishlistAction = useWishlistStore(
    (state) => state.remove,
  );

  const isWishlisted = has(id);

  // The grid card has no variant selection, but the backend requires a
  // specific variant to add to the cart. Send the shopper to the product
  // page to choose options rather than firing an add that can't succeed.
  const handleAddToCart = () => {
    router.push(`/products/${slug}`);
  };

  const handleWishlistToggle = () => {
    if (!token) {
      router.push(`/login?reason=login-required&return=/wishlist`);
      return;
    }

    if (isWishlisted) {
      void removeFromWishlistAction(id);
    } else {
      void addToWishlistAction(id);
    }
  };

  /**
   * next/image fires onError when the upstream file is missing
   * or returns a 4xx response.
   *
   * Swap to the universal placeholder so one broken product
   * image doesn't break the product grid.
   */
  const handleImageError = () => {
    if (resolvedImage !== UNIVERSAL_FALLBACK) {
      setResolvedImage(UNIVERSAL_FALLBACK);
    }
  };

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transition: "transform .25s ease, box-shadow .25s ease",
        border: "1px solid",
        borderColor: "divider",

        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 3,
        },

        "&:hover .product-card-image": {
          transform: "scale(1.06)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Link
          href={`/products/${slug}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {/* Product photo stage */}
          <Box
            sx={{
              height: 220,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#F3F1EC",
              overflow: "hidden",
            }}
          >
            <Box
              className="product-card-image"
              sx={{
                position: "relative",
                width: 170,
                height: 170,
                transition: "transform .35s ease",
              }}
            >
              <Image
                src={resolvedImage as string | StaticImageData}
                alt={title}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 33vw, 25vw"
                style={{
                  objectFit: "contain",
                }}
                onError={handleImageError}
              />
            </Box>
          </Box>
        </Link>

        {/* Badges */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {bestseller && (
            <Chip
              label="Bestseller"
              size="small"
              sx={{
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          )}

          {!bestseller && newArrival && (
            <Chip
              label="New"
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          )}

          <Chip
            label={offer}
            size="small"
            sx={{
              bgcolor: "error.main",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 22,
            }}
          />
        </Box>

        {/* Wishlist */}
        <IconButton
          onClick={handleWishlistToggle}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "#F3F1EC",
            boxShadow: 1,
            width: 34,
            height: 34,

            "&:hover": {
              bgcolor: "#F3F1EC",
            },
          }}
        >
          {isWishlisted ? (
            <FavoriteIcon
              sx={{
                fontSize: 18,
                color: "error.main",
              }}
            />
          ) : (
            <FavoriteBorderIcon
              sx={{
                fontSize: 18,
                color: "#0B1120",
              }}
            />
          )}
        </IconButton>
      </Box>

      <CardContent sx={{ pb: 2 }}>
        {/* Brand */}
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          {brand}
        </Typography>

        {/* Product title */}
        <Link
          href={`/products/${slug}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              mt: 0.5,
              minHeight: 44,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </Typography>
        </Link>

        {/* Rating */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            my: 1,
          }}
        >
          <StarIcon
            sx={{
              fontSize: 16,
              color: "secondary.main",
            }}
          />

          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
            }}
          >
            {Number.isFinite(rating) ? rating.toFixed(1) : "0.0"}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            ({formatReviews(reviews)})
          </Typography>
        </Box>

        {/* Price */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              bgcolor: "rgba(245,166,35,0.12)",
              color: "secondary.main",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              borderRadius: "4px",
              pl: 2,
              pr: 1.25,
              py: 0.5,
              fontSize: "1.1rem",

              "&::before": {
                content: '""',
                position: "absolute",
                left: -4,
                top: "50%",
                transform: "translateY(-50%)",
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "background.paper",
                border: "1px solid rgba(255,255,255,0.08)",
              },
            }}
          >
            ₹{formatPrice(price)}
          </Box>

          {originalPrice !== undefined &&
            Number(originalPrice) > Number(price) && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: "line-through",
                  color: "text.secondary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ₹{formatPrice(originalPrice)}
              </Typography>
            )}
        </Box>

        {/* Add to cart */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            borderRadius: 2,
          }}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}