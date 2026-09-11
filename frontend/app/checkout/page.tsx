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
import {
  createPayment,
  verifyPayment,
} from "@/services/paymentService";
import {
  loadRazorpay,
  openRazorpay,
  type RazorpayPaymentResponse,
} from "@/lib/razorpay";
import useRequireAuth from "@/hooks/useRequireAuth";

/**
 * NEXTCART — Checkout
 *
 * Backend-driven checkout flow:
 *
 * COD:
 *   1. Validate authentication/address.
 *   2. Create order.
 *   3. Clear cart.
 *   4. Redirect to order success.
 *
 * ONLINE:
 *   1. Validate authentication/address.
 *   2. Create order.
 *   3. Create Razorpay order from backend.
 *   4. Open Razorpay Checkout.
 *   5. Verify payment with backend.
 *   6. Clear cart only after successful verification.
 *   7. Redirect to order success.
 *
 * The backend remains the source of truth for order/payment amounts.
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

  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "ONLINE"
  >("COD");

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
   * Derive the selected address during render.
   */
  const effectiveSelectedAddressId = addresses.some(
    (address) => address.id === selectedAddressId
  )
    ? selectedAddressId
    : addresses.find((address) => address.isDefault === true)?.id ??
      addresses[0]?.id ??
      null;

  /**
   * Populate the checkout form from the selected saved address.
   */
  useEffect(() => {
    if (effectiveSelectedAddressId === null) {
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address.id === effectiveSelectedAddressId
    );

    if (!selectedAddress) {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setFullName(selectedAddress.fullName || "");
    setPhone(selectedAddress.phoneNumber || "");
    setAddressLine(selectedAddress.streetAddress || "");
    setCity(selectedAddress.city || "");
    setState(selectedAddress.state || "");
    setPincode(selectedAddress.postalCode || "");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [effectiveSelectedAddressId, addresses]);

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
   * Handle payment method selection.
   */
  const handlePaymentMethodChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (value === "COD" || value === "ONLINE") {
        setError("");
        setPaymentMethod(value);
      }
    },
    []
  );

  /**
   * Backend cart total used for the current checkout summary.
   *
   * The final online payment amount is still obtained from the backend
   * Razorpay order creation response.
   */
  const total = serverGrandTotal;

  /**
   * Synchronize the cart after a successful order/payment.
   */
const finishSuccessfulOrder = useCallback(
  async (orderId: number, orderNumber?: string) => {
    await clearCart();
    void fetchCart();

    if (!Number.isInteger(orderId) || orderId <= 0) {
      setError(
        "Order was created, but the order ID was not returned."
      );
      return;
    }

    const redirectUrl = orderNumber
      ? `/order-success?orderNumber=${encodeURIComponent(orderNumber)}`
      : `/order-success?orderId=${encodeURIComponent(String(orderId))}`;

    router.push(redirectUrl);
  },
  [clearCart, fetchCart, router]
);

  /**
   * Open Razorpay Checkout for an already-created NextCart order.
   */
  const startOnlinePayment = useCallback(
    async (orderId: number, orderNumber: string) => {
      /**
       * Load Razorpay's browser SDK only when online payment is actually used.
       */
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load the payment gateway. Please check your internet connection and try again."
        );
      }

      /**
       * Ask our backend to create the Razorpay order.
       *
       * IMPORTANT:
       * The backend calculates the amount.
       * `amount` returned here is already in paise.
       */
      const paymentOrderResult = await createPayment({
        orderId,
      });

      if (!paymentOrderResult.ok) {
        throw new Error(
          paymentOrderResult.message ||
            "Unable to initialize online payment."
        );
      }

      const paymentOrder = paymentOrderResult.data;

      if (
        !paymentOrder.razorpayOrderId ||
        !paymentOrder.keyId ||
        !paymentOrder.amount ||
        !paymentOrder.currency
      ) {
        throw new Error(
          "The payment gateway returned an incomplete payment configuration."
        );
      }

      /**
       * Open Razorpay.
       *
       * The backend amount is already in paise.
       * Do NOT multiply by 100 here.
       */
      openRazorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "NextCart",
        description: `Payment for order ${orderNumber}`,
        order_id: paymentOrder.razorpayOrderId,

        handler: async (
          response: RazorpayPaymentResponse
        ) => {
          try {
            setError("");

            /**
             * Verify the payment on our backend.
             *
             * Never trust the browser as the final payment authority.
             */
            const verificationResult = await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (!verificationResult.ok) {
              setSubmitting(false);
              setError(
                verificationResult.message ||
                  "Payment verification failed. Your order has not been confirmed."
              );
              return;
            }

            /**
             * Backend has confirmed the payment.
             * Only now is it safe to clear the cart.
             */
            await finishSuccessfulOrder(orderId, orderNumber);
          } catch (verificationError) {
            setSubmitting(false);

            const message =
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed. Please check your order status.";

            setError(message);
          }
        },

        modal: {
          /**
           * Razorpay was closed without completing payment.
           *
           * The order remains pending on the backend.
           * We deliberately do NOT clear the cart or redirect to success.
           */
          ondismiss: () => {
            setSubmitting(false);
            setError(
              "Payment was cancelled or the payment window was closed. Your order is still pending."
            );
          },
        },
      });
    },
    [finishSuccessfulOrder]
  );

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
         * Reuse existing saved address.
         */
        addressId = selectedAddress.id;
      } else {
        /**
         * Customer entered a new/changed address.
         * Save it before creating the order.
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
        setSelectedAddressId(addressId);
      }

      /**
       * Create the NextCart order.
       *
       * Backend contract:
       *
       * POST /api/orders
       * {
       *   addressId,
       *   paymentMethod
       * }
       *
       * The backend calculates the authoritative order total.
       */
      const result = await apiCheckout(addressId, paymentMethod);

      if (!result.ok) {
        setError(result.message || "Unable to place the order.");
        return;
      }

      const orderNumber = result.data.orderNumber;
      const orderId = Number(result.data.id);

      if (!orderNumber || !Number.isFinite(orderId)) {
        setError(
          "The order was created, but required order information was not returned."
        );
        return;
      }

      /**
       * COD:
       *
       * Order creation is sufficient because there is no online payment
       * to verify.
       */
      if (paymentMethod === "COD") {
  await finishSuccessfulOrder(orderId, orderNumber);
  return;
}

      /**
       * ONLINE:
       *
       * Create Razorpay order and open the payment gateway.
       *
       * Cart is NOT cleared here.
       * It is cleared only after backend payment verification succeeds.
       */
      await startOnlinePayment(orderId, orderNumber);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Checkout failed. Please try again.";

      setError(message);
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
    checking,
    authed,
    selectedAddressId,
    addresses,
    paymentMethod,
    finishSuccessfulOrder,
    startOnlinePayment,
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

                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel
                    value="COD"
                    control={<Radio />}
                    label="Cash on Delivery"
                  />

                  <FormControlLabel
                    value="ONLINE"
                    control={<Radio />}
                    label="Card / UPI"
                  />
                </RadioGroup>

                {paymentMethod === "ONLINE" && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    Pay securely using Razorpay with Card, UPI,
                    Net Banking or supported payment methods.
                  </Typography>
                )}
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
                  ? paymentMethod === "ONLINE"
                    ? "Processing Payment..."
                    : "Placing Order..."
                  : paymentMethod === "ONLINE"
                    ? "Pay Now"
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