"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Button,
  Divider,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import useCartStore from "@/store/cartStore";
import useAddressStore from "@/store/addressStore";
import useAuthStore from "@/store/authStore";
import {
  validateAddressPhone,
  validatePostalCode,
} from "@/components/auth/validation";

import { checkout as apiCheckout } from "@/services/orderService";
import { createAddress as apiCreateAddress } from "@/services/addressService";
import useRequireAuth from "@/hooks/useRequireAuth";

/**
 * NEXTCART — Checkout
 *
 * Backend-driven flow (Checkpoint 4):
 *   1. The cart's `serverGrandTotal` is the only number shown to the
 *      user for the total. We do NOT recompute it client-side.
 *   2. "Place Order" hits `POST /api/v1/orders/checkout` with
 *      `{ addressId, paymentMethod }`.
 *   3. If the user typed a fresh inline address, we first POST it to
 *      `/api/v1/addresses` (so we have an `addressId` to send).
 *   4. The local cart is only cleared AFTER the server returns 201.
 *      The server's `orderNumber` is the source of truth for the
 *      success page; no browser-generated IDs.
 *   5. Guests are redirected to /login — the backend checkout endpoint
 *      requires authentication.
 *
 * Visual layout is byte-identical to the prior version: same fields,
 * same Cards, same Order Summary block, same button labels.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const serverGrandTotal = useCartStore((s) => s.serverGrandTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchAddresses = useAddressStore((s) => s.fetchAll);
  const addresses = useAddressStore((s) => s.items);
  const token = useAuthStore((s) => s.token);

  const defaultAddress = addresses.find((a) => a.isDefault === true);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auth gate: checkout requires a logged-in user. Hydration-safe (waits for
  // the persisted token to be restored) so a logged-in user is not bounced to
  // /login on a hard refresh. Guests are redirected with a return path.
  useRequireAuth("/checkout");

  // Pre-fill the form from the user's default saved address, exactly once
  // after the addresses load. Only runs when fields are still empty so the
  // user can keep editing without their input being clobbered.
  useEffect(() => {
    if (token && defaultAddress) {
      flushSync(() => {
        setFullName((v) => v || defaultAddress.fullName || "");
        setPhone((v) => v || defaultAddress.phoneNumber || "");
        setAddressLine((v) => v || defaultAddress.streetAddress || "");
        setCity((v) => v || defaultAddress.city || "");
        setState((v) => v || defaultAddress.state || "");
        setPincode((v) => v || defaultAddress.postalCode || "");
      });
    }
  }, [token, defaultAddress]);

  // Kick off the address fetch + cart refresh on mount when authenticated.
  useEffect(() => {
    if (!token) return;
    void fetchAddresses();
    void fetchCart();
  }, [token, fetchAddresses, fetchCart]);

  // Brief: backend is the absolute source of truth for the total.
  const total = serverGrandTotal;
  const subtotal = serverGrandTotal; // free shipping + no discount yet

  /**
   * Decide which `addressId` to send. If the inline fields exactly
   * match a saved address (especially the default), reuse its id. If
   * the user typed something new, persist it first and use the
   * returned id.
   */
  const resolveAddressId = async (): Promise<number> => {
    if (defaultAddress && fieldsMatch(defaultAddress)) {
      return defaultAddress.id;
    }
    const createRes = await apiCreateAddress({
      fullName,
      phoneNumber: phone,
      streetAddress: addressLine,
      landmark: "",
      city,
      state,
      postalCode: pincode,
      country: "India",
      isDefault: addresses.length === 0,
    });
    if (!createRes.ok) {
      throw new Error(createRes.message);
    }
    return createRes.data.id;
  };

  function fieldsMatch(a: NonNullable<typeof defaultAddress>): boolean {
    return (
      a.fullName === fullName &&
      a.phoneNumber === phone &&
      a.streetAddress === addressLine &&
      a.city === city &&
      a.state === state &&
      a.postalCode === pincode
    );
  }

  const handlePlaceOrder = useCallback(async () => {
    if (submitting) return;

    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      setError("Please fill in all address fields.");
      return;
    }

    const phoneError = validateAddressPhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    const pincodeError = validatePostalCode(pincode);
    if (pincodeError) {
      setError(pincodeError);
      return;
    }

    if (paymentMethod !== "COD") {
      setError("Online payment is not available yet. Please select Cash on Delivery.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // Step 1: resolve the addressId.
      const addressId = await resolveAddressId();

      // Step 2: hit the server-authoritative checkout endpoint.
      const result = await apiCheckout(addressId, "COD");
      if (!result.ok) {
        setError(result.message);
        return;
      }

      // Step 3: only clear the local cart AFTER the server returns
      // success. Re-fetch so the server-cart is empty too.
      await clearCart();
      void fetchCart();

      // Step 4: navigate with the server's orderNumber — no mock IDs.
      router.push(`/order-success?orderId=${encodeURIComponent(result.data.orderNumber)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    paymentMethod,
    clearCart,
    fetchCart,
    resolveAddressId,
    router,
  ]);

  if (items.length === 0) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Your Cart is Empty
          </Typography>
          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Add items to your cart before checking out.
          </Typography>
          <Button component={Link} href="/" variant="contained" size="large" sx={{ mt: 4 }}>
            Continue Shopping
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Checkout
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 4,
          }}
        >
          {/* Left: Address + Payment */}
          <Box>
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Delivery Address
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Payment Method
                </Typography>

                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "COD" | "ONLINE")
                  }
                >
                  <FormControlLabel
                    value="COD"
                    control={<Radio />}
                    label="Cash on Delivery"
                  />
                  <FormControlLabel
                    value="ONLINE"
                    control={<Radio />}
                    label="Card / UPI (Coming Soon)"
                    disabled
                  />
                </RadioGroup>
              </CardContent>
            </Card>
          </Box>

          {/* Right: Order Summary */}
          <Card
            sx={{
              height: "fit-content",
              borderRadius: 3,
              position: "sticky",
              top: 90,
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Order Summary
              </Typography>

              <Divider sx={{ my: 3 }} />

              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={50}
                    height={50}
                    style={{ objectFit: "contain" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography>Subtotal</Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  ₹{subtotal.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography>Shipping</Typography>
                <Typography color="success.main">FREE</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ₹{total.toLocaleString()}
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 4, py: 1.5, borderRadius: 2 }}
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? "Placing Order…" : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
      <Footer />
    </>
  );
}