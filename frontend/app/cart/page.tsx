"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import CartItemRow from "@/components/cart/CartItemRow";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CartSkeleton from "@/components/cart/CartSkeleton";
import CartEmptyState from "@/components/cart/CartEmptyState";

import useCartStore from "@/store/cartStore";
import useAuthStore from "@/store/authStore";

/**
 * NEXTCART — Cart page
 *
 * Composition layer for the cart UI. All cart state and business logic
 * lives in the existing Zustand store (store/cartStore.ts) and the
 * authenticated cart service (services/cartService.ts → /api/v1/cart).
 * This page only:
 *
 *   - triggers the existing fetchCart() on mount when authenticated,
 *   - maps store state to the presentational components,
 *   - forwards mutations to the existing store actions
 *     (increase/decrease → updateQuantity, removeFromCart),
 *   - keeps the existing /checkout navigation and auth behaviour.
 *
 * Amounts — the backend is authoritative (unchanged semantics):
 *   orderTotal    → Subtotal / Total Payable
 *   productPrice  → total MRP before discount
 *   totalDiscount → total discount applied
 * (productPrice/totalDiscount are now surfaced by the store additively
 * instead of the page hardcoding ₹0.)
 */
export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const serverGrandTotal = useCartStore((s) => s.serverGrandTotal);
  // New additive exposures — the backend already sent these values.
  const serverProductPrice = useCartStore((s) => s.serverProductPrice);
  const serverTotalDiscount = useCartStore((s) => s.serverTotalDiscount);

  const error = useCartStore((s) => s.error);
  const clearError = useCartStore((s) => s.clearError);
  const loading = useCartStore((s) => s.loading);

  const token = useAuthStore((s) => s.token);

  /*
   * Hydrate from the server when the page mounts.
   * The server cart is the source of truth for
   * authenticated users. (Existing behaviour.)
   */
  useEffect(() => {
    if (token) {
      void fetchCart();
    }
  }, [token, fetchCart]);

  /*
   * Track which row has a mutation in flight so only that row shows
   * row-level "Updating…" feedback. The store keeps a single global
   * `loading`; a row counts as busy only while loading is true AND it
   * was the last row clicked. When loading settles the pair goes inert
   * automatically (pure derivation — no effect-driven setState), and
   * the next click simply overwrites the remembered row id.
   */
  const [lastClickedRowId, setLastClickedRowId] = useState<
    number | string | null
  >(null);
  const isRowBusy = (rowId: number | string) =>
    loading && lastClickedRowId === rowId;

  /*
   * Backend totals (unchanged semantics):
   *   orderTotal    → the final payable amount
   *   productPrice  → total MRP before discount
   *   totalDiscount → total discount applied
   */
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Header />

      {/*
        Main states:
          1. Loading (first fetch) → skeleton
          2. Empty cart → empty state (errors surfaced)
          3. Cart with items → list + summary
      */}
      {loading && items.length === 0 ? (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          <CartSkeleton />
        </Container>
      ) : items.length === 0 ? (
        <CartEmptyState
          error={error}
          onDismissError={clearError}
          onRetry={token ? () => void fetchCart() : undefined}
        />
      ) : (
        <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
          {/* Heading row. */}
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              rowGap: 0.5,
              mb: { xs: 2, md: 3 },
            }}
          >
            <Typography
              component="h1"
              sx={{ fontWeight: 700, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
            >
              Shopping Cart
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </Typography>
          </Box>

          {/* Global cart errors — surfaced, never hidden. */}
          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={{ xs: 2.5, md: 4 }}>
            {/* ── Item list ──────────────────────────────────────────── */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: { xs: 2, md: 3 },
                  px: { xs: 1.5, sm: 2.5, md: 3 },
                  py: 1,
                  minWidth: 0,
                }}
              >
                {items.map((item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      borderBottom:
                        index < items.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    <CartItemRow
                      item={item}
                      busy={isRowBusy(item.id)}
                      disabled={loading && !isRowBusy(item.id)}
                      onIncrease={() => {
                        setLastClickedRowId(item.id);
                        increaseQuantity(item.id, {});
                      }}
                      onDecrease={() => {
                        if (item.quantity <= 1) return; // store clamps at 1 anyway
                        setLastClickedRowId(item.id);
                        decreaseQuantity(item.id, {});
                      }}
                      onRemove={() => {
                        setLastClickedRowId(item.id);
                        void removeFromCart(item.id);
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* ── Order summary ──────────────────────────────────────── */}
            <Grid size={{ xs: 12, md: 4 }}>
              <CartOrderSummary
                productPrice={serverProductPrice}
                totalDiscount={serverTotalDiscount}
                orderTotal={serverGrandTotal}
                itemCount={itemCount}
                updating={loading}
              />
            </Grid>
          </Grid>
        </Container>
      )}

      <Footer />
    </>
  );
}
