"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

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
  Alert,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import useCartStore from "@/store/cartStore";
import useAuthStore from "@/store/authStore";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const increaseQuantity = useCartStore(
    (s) => s.increaseQuantity,
  );
  const decreaseQuantity = useCartStore(
    (s) => s.decreaseQuantity,
  );
  const removeFromCart = useCartStore(
    (s) => s.removeFromCart,
  );
  const fetchCart = useCartStore(
    (s) => s.fetchCart,
  );

  const serverGrandTotal = useCartStore(
    (s) => s.serverGrandTotal,
  );

  const error = useCartStore(
    (s) => s.error,
  );

  const clearError = useCartStore(
    (s) => s.clearError,
  );

  const loading = useCartStore(
    (s) => s.loading,
  );

  const token = useAuthStore(
    (s) => s.token,
  );

  /*
   * Hydrate from the server when the page mounts.
   * The server cart is the source of truth for
   * authenticated users.
   */
  useEffect(() => {
    if (token) {
      void fetchCart();
    }
  }, [token, fetchCart]);

  /*
   * Backend is authoritative for the final
   * payable cart amount.
   */
  const total = serverGrandTotal;

  /*
   * Until productPrice / totalDiscount are
   * exposed through the Zustand store, keep
   * subtotal aligned with the current backend
   * final total.
   *
   * We will improve this in the next store
   * update to use:
   * productPrice - totalDiscount = orderTotal
   */
  const subtotal = serverGrandTotal;

  /*
   * Loading state
   */
  if (loading && items.length === 0) {
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
            sx={{ fontWeight: 600 }}
          >
            Loading your cart...
          </Typography>
        </Container>

        <Footer />
      </>
    );
  }

  /*
   * Empty cart state
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
          {error && (
            <Alert
              severity="error"
              onClose={clearError}
              sx={{
                mb: 4,
                textAlign: "left",
              }}
            >
              {error}
            </Alert>
          )}

          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Your Cart is Empty
          </Typography>

          <Typography
            sx={{
              mt: 2,
              color: "text.secondary",
            }}
          >
            Looks like you haven&apos;t added any
            products yet.
          </Typography>

          <Button
            component={Link}
            href="/"
            variant="contained"
            sx={{
              mt: 4,
              px: 4,
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

  /*
   * Cart with items
   */
  return (
    <>
      <Header />

      <Container
        maxWidth="xl"
        sx={{ py: 5 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 4,
          }}
        >
          Shopping Cart ({items.length})
        </Typography>

        {error && (
          <Alert
            severity="error"
            onClose={clearError}
            sx={{
              mb: 3,
            }}
          >
            {error}
          </Alert>
        )}

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
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                    }}
                  >
                    {/* Product image */}
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {item.image?.trim() ? (
                        <Link
                          href={`/products/${item.slug}`}
                        >
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
                      ) : (
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            color: "text.secondary",
                            fontSize: 13,
                            textAlign: "center",
                            px: 1,
                          }}
                        >
                          Image unavailable
                        </Box>
                      )}
                    </Box>

                    {/* Product information */}
                    <Box
                      sx={{
                        flex: 1,
                        width: {
                          xs: "100%",
                          sm: "auto",
                        },
                      }}
                    >
                      <Link
                        href={`/products/${item.slug}`}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                          }}
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
                        ₹
                        {item.price.toLocaleString()}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Total: ₹
                        {item.itemTotal.toLocaleString()}
                      </Typography>

                      {/* Quantity controls */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 3,
                        }}
                      >
                        <IconButton
                          disabled={loading}
                          sx={{
                            border: "1px solid #ddd",
                          }}
                          onClick={() =>
                            decreaseQuantity(
                              item.id,
                              {
                                variantId:
                                  item.variantId,
                              },
                            )
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
                            justifyContent:
                              "center",
                            alignItems: "center",
                            border:
                              "1px solid #ddd",
                          }}
                        >
                          {item.quantity}
                        </Paper>

                        <IconButton
                          disabled={loading}
                          sx={{
                            border: "1px solid #ddd",
                          }}
                          onClick={() =>
                            increaseQuantity(
                              item.id,
                              {
                                variantId:
                                  item.variantId,
                              },
                            )
                          }
                        >
                          <AddIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          disabled={loading}
                          onClick={() =>
                            void removeFromCart(
                              item.id,
                            )
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
                  justifyContent:
                    "space-between",
                  mb: 2,
                }}
              >
                <Typography>
                  Subtotal
                </Typography>

                <Typography
                  sx={{ fontWeight: 600 }}
                >
                  ₹
                  {subtotal.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  mb: 2,
                }}
              >
                <Typography>
                  Discount
                </Typography>

                <Typography
                  color="success.main"
                >
                  ₹0
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  mb: 2,
                }}
              >
                <Typography>
                  Shipping
                </Typography>

                <Typography
                  color="success.main"
                >
                  FREE
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
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
                  ₹
                  {total.toLocaleString()}
                </Typography>
              </Box>

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