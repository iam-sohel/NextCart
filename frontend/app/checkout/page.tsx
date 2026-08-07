"use client";

import { useState } from "react";
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
import useOrderStore from "@/store/orderStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [error, setError] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700}>
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

  const handlePlaceOrder = () => {
    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      setError("Please fill in all address fields.");
      return;
    }

    if (paymentMethod !== "COD") {
      setError("Online payment is not available yet. Please select Cash on Delivery.");
      return;
    }

    setError("");

    const orderId = `NC${Date.now().toString(36).toUpperCase()}`;

    addOrder({
      orderId,
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      shipping,
      total,
      address: { fullName, phone, addressLine, city, state, pincode },
      paymentMethod,
      orderDate: Date.now(),
    });

    clearCart();
    router.push(`/order-success?orderId=${orderId}`);
  };

  return (
    <>
      <Header />

      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
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
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Delivery Address
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
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
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
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
              <Typography variant="h5" fontWeight={700}>
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
                    <Typography variant="body2" fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Subtotal</Typography>
                <Typography fontWeight={600}>
                  ₹{subtotal.toLocaleString()}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Shipping</Typography>
                <Typography color="success.main">FREE</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700}>
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
              >
                Place Order
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Footer />
    </>
  );
}