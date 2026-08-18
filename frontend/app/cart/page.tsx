"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  IconButton,
  Paper,
  Box,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import useCartStore from "@/store/cartStore";

export default function CartPage() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCartStore();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Your Cart is Empty
          </Typography>

          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Looks like you haven&apos;t added any products yet.
          </Typography>

          <Button
  component={Link}
  href="/checkout"
  fullWidth
  variant="contained"
  size="large"
  sx={{
    mt: 4,
    py: 1.5,
    borderRadius: 2,
  }}
>
  Proceed to Checkout
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
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 4 }}
        >
          Shopping Cart ({items.length})
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
          {/* Left Side */}

          <Box>
            {items.map((item) => (
              <Card
                key={item.id}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      alignItems: "center",
                    }}
                  >
                    <Link href={`/products/${item.slug}`}>
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={120}
                        height={120}
                        style={{
                          objectFit: "contain",
                          cursor: "pointer",
                        }}
                      />
                    </Link>

                    <Box sx={{ flex: 1 }}>
                      <Link
                        href={`/products/${item.slug}`}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700 }}
                        >
                          {item.title}
                        </Typography>
                      </Link>

                      {item.variantLabel && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {item.variantLabel}
                        </Typography>
                      )}

                      <Typography
                        color="primary"
                        sx={{
                          mt: 1,
                          fontWeight: 700,
                          fontSize: 24,
                        }}
                      >
                        ₹{item.price.toLocaleString()}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Total: ₹
                        {(item.price * item.quantity).toLocaleString()}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 3,
                        }}
                      >
                        <IconButton
                          sx={{
                            border: "1px solid #ddd",
                          }}
                          onClick={() =>
                            decreaseQuantity(item.id, {
                              variantId: item.variantId,
                            })
                          }
                        >
                          <RemoveIcon />
                        </IconButton>

                        <Paper
                          elevation={0}
                          sx={{
                            width: 50,
                            height: 38,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "1px solid #ddd",
                          }}
                        >
                          {item.quantity}
                        </Paper>

                        <IconButton
                          sx={{
                            border: "1px solid #ddd",
                          }}
                          onClick={() =>
                            increaseQuantity(item.id, {
                              variantId: item.variantId,
                            })
                          }
                        >
                          <AddIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() =>
                            removeFromCart(item.id, {
                              variantId: item.variantId,
                            })
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Order Summary */}

          <Card
            sx={{
              height: "fit-content",
              borderRadius: 3,
              position: "sticky",
              top: 90,
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700 }}
              >
                Order Summary
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography>Subtotal</Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  ₹{subtotal.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography>Discount</Typography>

                <Typography color="success.main">
                  ₹0
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
                  sx={{ fontWeight: 700 }}
                >
                  Total
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  ₹{total.toLocaleString()}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Proceed to Checkout
              </Button>

              <Button
                component={Link}
                href="/"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Footer />
    </>
  );
}