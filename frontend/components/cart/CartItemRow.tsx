"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Box,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import type { CartItem } from "@/store/cartStore";

/**
 * NEXTCART — CartItemRow
 *
 * One line of the cart list. Pure presentation: every value comes from
 * the backend-mapped CartItem (unitPrice, lineTotal, quantity) and every
 * mutation is delegated to the parent, which calls the existing store
 * actions (updateQuantity / removeFromCart). No business logic here.
 *
 * Presentation notes:
 *   - Hairline dividers between rows instead of heavy per-item cards,
 *     matching the polished product-details surface.
 *   - Price hierarchy: unit price (large) + per-item line total.
 *   - Quantity stepper has 40px+ touch targets and full disabled states.
 *   - Remove is a labelled icon button with a tooltip.
 */
export default function CartItemRow({
  item,
  busy,
  disabled,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  /** True while THIS row has a mutation in flight (row-level feedback). */
  busy?: boolean;
  /** True while the cart is loading/updating globally (disables input). */
  disabled?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const safeImage = typeof item.image === "string" ? item.image.trim() : "";
  const lockControls = Boolean(disabled);
  const hasVariant = Boolean(item.variantLabel?.trim());

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 1.5, sm: 2.5 },
        py: { xs: 2, md: 2.5 },
        px: { xs: 0.5, sm: 0 },
        alignItems: "flex-start",
        opacity: busy ? 0.7 : 1,
        transition: "opacity 0.2s ease",
        minWidth: 0,
      }}
    >
      {/* Product image — links to the product page. */}
      <Box
        sx={{
          width: { xs: 88, sm: 112 },
          height: { xs: 88, sm: 112 },
          flexShrink: 0,
          bgcolor: "grey.50",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {safeImage ? (
          <Box
            component={Link}
            href={`/products/${item.slug}`}
            sx={{ position: "relative", width: "100%", height: "100%", display: "block" }}
            aria-label={`View ${item.title || "product"}`}
          >
            <Image
              src={safeImage}
              alt={item.title || "Product image"}
              fill
              sizes="112px"
              style={{ objectFit: "contain", padding: 4 }}
            />
          </Box>
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 1, textAlign: "center" }}
          >
            No image
          </Typography>
        )}
      </Box>

      {/* Details + controls. */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}
        >
          <Box sx={{ minWidth: 0 }}>
            {/* Product title. */}
            <Link
              href={`/products/${item.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.9375rem", sm: "1rem" },
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  overflowWrap: "break-word",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {item.title || "Product"}
              </Typography>
            </Link>

            {/* Selected variant. */}
            {hasVariant && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, overflowWrap: "anywhere" }}
              >
                {item.variantLabel}
              </Typography>
            )}

            {/* Unit price + backend line total. */}
            <Stack
              direction="row"
              spacing={1.5}
              useFlexGap
              sx={{ alignItems: "baseline", mt: 0.75, flexWrap: "wrap", rowGap: 0.25 }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.0625rem", sm: "1.1875rem" },
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ₹{item.price.toLocaleString("en-IN")}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {item.itemTotal.toLocaleString("en-IN")} for {item.quantity}{" "}
                {item.quantity === 1 ? "item" : "items"}
              </Typography>
            </Stack>
          </Box>

          {/* Remove action. */}
          <Tooltip title="Remove from cart">
            <IconButton
              aria-label={`Remove ${item.title || "item"} from cart`}
              onClick={onRemove}
              disabled={lockControls}
              size="small"
              sx={{
                flexShrink: 0,
                color: "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                "&:hover": {
                  color: "error.main",
                  borderColor: "error.main",
                  bgcolor: "error.light",
                },
              }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Quantity stepper. */}
        <Stack
          direction="row"
          sx={{ alignItems: "center", mt: { xs: 1.5, sm: 2 }, gap: 1.5, flexWrap: "wrap" }}
        >
          <Box
            role="group"
            aria-label={`Quantity for ${item.title || "item"}`}
            sx={{
              display: "inline-flex",
              alignItems: "stretch",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.paper",
              opacity: lockControls ? 0.6 : 1,
            }}
          >
            <IconButton
              aria-label={`Decrease quantity of ${item.title || "item"}`}
              onClick={onDecrease}
              disabled={lockControls || item.quantity <= 1}
              sx={{ borderRadius: 0, px: { xs: 1.25, sm: 1.5 }, width: { xs: 40, sm: 42 } }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>

            <Box
              aria-live="polite"
              sx={{
                minWidth: { xs: 40, sm: 44 },
                px: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderLeft: "1px solid",
                borderRight: "1px solid",
                borderColor: "divider",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                fontSize: "0.9375rem",
              }}
            >
              {busy ? <Skeleton width={16} /> : item.quantity}
            </Box>

            <IconButton
              aria-label={`Increase quantity of ${item.title || "item"}`}
              onClick={onIncrease}
              disabled={lockControls}
              sx={{ borderRadius: 0, px: { xs: 1.25, sm: 1.5 }, width: { xs: 40, sm: 42 } }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          {busy && (
            <Typography variant="caption" color="text.secondary">
              Updating…
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
