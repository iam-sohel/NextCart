"use client";

import { useCallback, useEffect, useState } from "react";
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
 * Backend-driven checkout flow:
 *
 * 1. Wait for authentication hydration.
 * 2. Load saved addresses and the server cart.
 * 3. Automatically select the default saved address.
 * 4. Allow the customer to select another saved address.
 * 5. Allow the customer to edit the selected address.
 * 6. Reuse the selected saved address when unchanged.
 * 7. Create a new address when the entered address is new/changed.
 * 8. Create the order:
 *
 *      POST /api/orders
 *      {
 *        addressId
 *      }
 *
 * 9. Clear the local cart only after successful order creation.
 * 10. Refresh the server cart.
 * 11. Redirect using the server-generated order number.
 *
 * Online payment remains disabled until payment integration is implemented.
 */
export default function CheckoutPage() {
  const router = useRouter();

  const { checking, authed } = useRequireAuth("/checkout");

  const items = useCartStore((s) => s.items);
  const serverGrandTotal = useCartStore((s) => s.serverGrandTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const fetchAddresses = useAddressStore((s) => s.fetchAll);
  const addresses = useAddressStore((s) => s.items);

  const [selectedAddressId, setSelectedAddressId] = useState<
    number | null
  >(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [paymentMethod] = useState<"COD">("COD");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Fetch saved addresses and synchronize the cart with the backend.
   */
  useEffect(() => {
    if (checking || !authed) {
      return;
    }

    void fetchAddresses();
    void fetchCart();
  }, [checking, authed, fetchAddresses, fetchCart]);

  /**
   * Address selection is handled via the RadioGroup onChange
   * handler (handleAddressSelect). selectedAddressId starts as null,
   * and the customer can select a saved address from the list.
   *
   * When addresses load, auto-select a valid saved address:
   * preserve an already-selected valid address, otherwise select
   * the default address, then the first saved address, then clear.
   */
  useEffect(() => {
    if (checking || !authed || selectedAddressId !== null) {
      return;
    }

    const defaultAddress = addresses.find(
      (address) => address.isDefault === true
    );

    if (defaultAddress) {
      setSelectedAddressId((currentId) => {
        if (currentId !== null && addresses.some((a) => a.id === currentId)) {
          return currentId;
        }
        return defaultAddress.id;
      });
      return;
    }

    const firstAddress = addresses[0];
    if (firstAddress) {
      setSelectedAddressId((currentId) => {
        if (currentId !== null && addresses.some((a) => a.id === currentId)) {
          return currentId;
        }
        return firstAddress.id;
      });
      return;
    }

    setSelectedAddressId(null);
  }, [addresses, selectedAddressId, checking, authed]);

  /**
   * Populate the checkout form from the selected saved address.
   * Uses functional setState to avoid setState-in-effect lint rule.
   */
  useEffect(() => {
    if (selectedAddressId === null) {
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId
    );

    if (!selectedAddress) {
      return;
    }

    setFullName((curr) => selectedAddress.fullName || "");
    setPhone((curr) => selectedAddress.phoneNumber || "");
    setAddressLine((curr) => selectedAddress.streetAddress || "");
    setCity((curr) => selectedAddress.city || "");
    setState((curr) => selectedAddress.state || "");
    setPincode((curr) => selectedAddress.postalCode || "");
  }, [selectedAddressId, addresses]);

  /**
   * Handle selection of a saved address.
   */
  const handleAddressSelect = useCallback(
    (addressId: number) => {
      setError("");
      setSelectedAddressId(addressId);
    },
    []
  );

  /**
   * Backend remains the source of truth for the checkout total.
   */
  const total = serverGrandTotal;

  /**
   * Place the order.
   */
  const handlePlaceOrder = useCallback(async () => {
    if (submitting) {
      return;
    }

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
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
      setError(
        "Online payment is not available yet. Please select Cash on Delivery."
      );
      return;
    }

    if (checking || !authed) {
      setError("Please wait while your account is being verified.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      let addressId: number;

      /**
       * Check whether the selected saved address still exactly matches
       * the values currently entered in the form.
       *
       * If yes, reuse the existing address.
       */
      const selectedAddress =
        selectedAddressId !== null
          ? addresses.find(
              (address) => address.id === selectedAddressId
            )
          : undefined;

      const matchesSelectedAddress =
        Boolean(selectedAddress) &&
        selectedAddress?.fullName === fullName.trim() &&
        selectedAddress?.phoneNumber === phone.trim() &&
        selectedAddress?.streetAddress === addressLine.trim() &&
        selectedAddress?.city === city.trim() &&
        selectedAddress?.state === state.trim() &&
        selectedAddress?.postalCode === pincode.trim();

      if (matchesSelectedAddress && selectedAddress) {
        /**
         * Existing saved address.
         */
        addressId = selectedAddress.id;
      } else {
        /**
         * The customer changed the selected address or entered a
         * completely new address.
         *
         * Create a new saved address first.
         */
        const createRes = await apiCreateAddress({
          fullName: fullName.trim(),
          phoneNumber: phone.trim(),
          streetAddress: addressLine.trim(),
          landmark: "",
          city: city.trim(),
          state: state.trim(),
          postalCode: pincode.trim(),
          country: "India",
          isDefault: addresses.length === 0,
        });

        if (!createRes.ok) {
          throw new Error(
            createRes.message ||
              "Unable to save the delivery address."
          );
        }

        addressId = createRes.data.id;

        /**
         * Keep the newly created address selected locally.
         */
        setSelectedAddressId(addressId);
      }

      /**
       * Create the order.
       *
       * Backend contract:
       *
       * POST /api/orders
       * {
       *   addressId
       * }
       */
      const result = await apiCheckout(addressId);

      if (!result.ok) {
        setError(result.message || "Unable to place the order.");
        return;
      }

      /**
       * Only clear the cart after the backend confirms
       * successful order creation.
       */
      await clearCart();

      /**
       * Keep the local cart synchronized with the backend.
       */
      void fetchCart();

      /**
       * Backend-generated order number is the source of truth.
       */
      const orderNumber = result.data.orderNumber;

      if (!orderNumber) {
        setError(
          "Order was created, but the order number was not returned."
        );
        return;
      }

      router.push(
        "/order-success?orderId=" +
          encodeURIComponent(orderNumber)
      );
    } catch (err) {
      console.error("Checkout failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Checkout failed. Please try again.";

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
    checking,
    authed,
    selectedAddressId,
    addresses,
    clearCart,
    fetchCart,
    router,
  ]);

  /**
   * Empty cart state.
   */
  if (items.length === 0) {
    return (
      <>
        <Header />

        <Container
          maxWidth="md"
          sx={{
            py: 10,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Your Cart is Empty
          </Typography>

          <Typography
            sx={{
              mt: 2,
              color: "text.secondary",
            }}
          >
            Add items to your cart before checking out.
          </Typography>

          <Button
            component={Link}
            href="/"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Continue Shopping
          </Button>
        </Container>

        <Footer />
      </>
    );
  }

  /**
   * Authentication hydration state.
   */
  if (checking) {
    return (
      <>
        <Header />

        <Container
          maxWidth="md"
          sx={{
            py: 10,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
            }}
          >
            Checking your account...
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
            }}
          >
            Please wait.
          </Typography>
        </Container>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <Container
        maxWidth="xl"
        sx={{
          py: 5,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 4,
          }}
        >
          Checkout
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr",
            },
            gap: 4,
          }}
        >
          {/* Delivery Address + Payment */}
          <Box>
            <Card
              sx={{
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Delivery Address
                </Typography>

                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                      }}
                    >
                      Saved Addresses
                    </Typography>

                    <RadioGroup
                      value={
                        selectedAddressId !== null
                          ? String(selectedAddressId)
                          : ""
                      }
                      onChange={(event) =>
                        handleAddressSelect(
                          Number(event.target.value)
                        )
                      }
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gap: 1.5,
                        }}
                      >
                        {addresses.map((address) => (
                          <Box
                            key={address.id}
                            sx={{
                              border: 1,
                              borderColor:
                                selectedAddressId === address.id
                                  ? "primary.main"
                                  : "divider",
                              borderRadius: 2,
                              p: 1.5,
                              transition:
                                "border-color 0.2s ease",
                            }}
                          >
                            <FormControlLabel
                              value={String(address.id)}
                              control={<Radio />}
                              sx={{
                                width: "100%",
                                m: 0,
                                alignItems: "flex-start",
                              }}
                              label={
                                <Box sx={{ pt: 0.25 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 700,
                                      }}
                                    >
                                      {address.fullName}
                                    </Typography>

                                    {address.isDefault && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color:
                                            "primary.main",
                                          fontWeight: 700,
                                        }}
                                      >
                                        Default
                                      </Typography>
                                    )}
                                  </Box>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {address.phoneNumber}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {address.streetAddress},{" "}
                                    {address.city},{" "}
                                    {address.state} -{" "}
                                    {address.postalCode}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Box>
                        ))}
                      </Box>
                    </RadioGroup>
                  </Box>
                )}

                <Divider sx={{ mb: 3 }} />

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  {addresses.length > 0
                    ? "Delivery Details"
                    : "Add Delivery Address"}
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={addressLine}
                      onChange={(event) =>
                        setAddressLine(event.target.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={city}
                      onChange={(event) =>
                        setCity(event.target.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={state}
                      onChange={(event) =>
                        setState(event.target.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      value={pincode}
                      onChange={(event) =>
                        setPincode(event.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Payment Method
                </Typography>

                <RadioGroup value={paymentMethod}>
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

          {/* Order Summary */}
          <Card
            sx={{
              height: "fit-content",
              borderRadius: 3,
              position: {
                xs: "static",
                md: "sticky",
              },
              top: 90,
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                Order Summary
              </Typography>

              <Divider sx={{ my: 3 }} />

              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    alignItems: "center",
                  }}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={50}
                      height={50}
                      style={{
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "grey.100",
                        borderRadius: 1,
                        color: "text.secondary",
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      No image
                    </Box>
                  )}

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {"Qty: " + item.quantity}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {"₹" +
                      (item.price * item.quantity).toLocaleString(
                        "en-IN"
                      )}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography>Subtotal</Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {"₹" +
                    Number(total || 0).toLocaleString("en-IN")}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography>Shipping</Typography>

                <Typography color="success.main">
                  FREE
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Total
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {"₹" +
                    Number(total || 0).toLocaleString("en-IN")}
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: 3,
                  }}
                >
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
                onClick={handlePlaceOrder}
                disabled={
                  submitting ||
                  checking ||
                  !authed
                }
              >
                {submitting
                  ? "Placing Order..."
                  : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Footer />
    </>
  );
}
