"use client";

import Link from "next/link";

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

/**
 * NEXTCART — CartOrderSummary
 *
 * The right-hand order summary. Pure presentation: every amount comes
 * from the backend cart response (productPrice → "MRP", totalDiscount →
 * "Discount", orderTotal → "Total Payable") surfaced through the store.
 * No pricing logic is invented here.
 *
 * The checkout CTA keeps the existing `/checkout` navigation and the
 * existing "cart must be complete before checkout" gating.
 */
export default function CartOrderSummary({
  productPrice,
  totalDiscount,
  orderTotal,
  itemCount,
  checkoutDisabled,
  checkoutDisabledReason,
  updating,
}: {
  productPrice: number;
  totalDiscount: number;
  orderTotal: number;
  itemCount: number;
  checkoutDisabled?: boolean;
  checkoutDisabledReason?: string;
  updating?: boolean;
}) {
  const showDiscount = totalDiscount > 0;

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 2, md: 3 },
        position: "sticky",
        top: 90,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "1.0625rem" }}>
        Order Summary
      </Typography>

      <Divider sx={{ my: 2.5 }} />

      {/* PRICE DETAILS row — Flipkart-style section label. */}
      <Typography
        variant="overline"
        sx={{
          display: "block",
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: "0.08em",
          mb: 1.5,
        }}
      >
        Price Details ({itemCount} {itemCount === 1 ? "item" : "items"})
      </Typography>

      <Stack spacing={1.5}>
        {/* Total MRP — only shown when the backend reports a discount. */}
        {showDiscount && (
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography color="text.secondary">
              Price ({itemCount} {itemCount === 1 ? "item" : "items"})
            </Typography>
            <Typography sx={{ fontVariantNumeric: "tabular-nums" }}>
              ₹{productPrice.toLocaleString("en-IN")}
            </Typography>
          </Stack>
        )}

        {/* Subtotal — the backend orderTotal; unchanged semantics. */}
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            ₹{orderTotal.toLocaleString("en-IN")}
          </Typography>
        </Stack>

        {/* Backend-reported discount. */}
        {showDiscount && (
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography color="text.secondary">Discount</Typography>
            <Typography
              sx={{
                color: "success.main",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              − ₹{totalDiscount.toLocaleString("en-IN")}
            </Typography>
          </Stack>
        )}

        {/* Shipping is a UI affirmation, not a price promise: the backend
            orderTotal already accounts for it. */}
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Typography color="text.secondary">Shipping</Typography>
          <Typography sx={{ color: "success.main", fontWeight: 600 }}>
            Free
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      {/* Final payable amount — backend orderTotal. */}
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "baseline" }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.0625rem" }}>
          Total Payable
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.375rem", md: "1.5rem" },
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ₹{orderTotal.toLocaleString("en-IN")}
        </Typography>
      </Stack>

      {showDiscount && productPrice > 0 && (
        <Typography
          variant="body2"
          sx={{ mt: 1, color: "success.main", fontWeight: 600 }}
        >
          You will save ₹{totalDiscount.toLocaleString("en-IN")} on this order
        </Typography>
      )}

      <Button
        component={Link}
        href="/checkout"
        fullWidth
        variant="contained"
        size="large"
        disabled={checkoutDisabled || updating}
        startIcon={
          updating ? <CircularProgress size={16} color="inherit" /> : undefined
        }
        sx={{
          mt: 3,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 700,
          minHeight: 48,
        }}
      >
        {updating ? "Updating cart…" : "Proceed to Checkout"}
      </Button>

      {checkoutDisabled && checkoutDisabledReason && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block", textAlign: "center" }}
        >
          {checkoutDisabledReason}
        </Typography>
      )}

      <Button
        component={Link}
        href="/products"
        fullWidth
        variant="outlined"
        sx={{ mt: 1.5, borderRadius: 2 }}
      >
        Continue Shopping
      </Button>

      {/* Reassurance row — static trust copy, no fake data. */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 3, pt: 2.5, borderTop: "1px solid", borderColor: "divider" }}
      >
        <LocalShippingOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Free delivery
          </Typography>
          <Typography variant="caption" color="text.secondary">
            On eligible orders
          </Typography>
        </Box>
        <ShieldOutlinedIcon
          sx={{ fontSize: 20, color: "text.secondary", ml: "auto" }}
        />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Safe payments
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Secure checkout
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
