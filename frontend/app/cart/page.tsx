"use client";

import Link from "next/link";

import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import Box from "@mui/material/Box";

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

  if (items.length === 0) {
    return (
      <>
        <Header />

        <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Your Cart is Empty
          </Typography>

          <Typography
            sx={{
              mt: 2,
              color: "text.secondary",
            }}
          >
            Looks like you haven&apos;t added anything yet.
          </Typography>

          <Button
            component={Link}
            href="/"
            variant="contained"
            sx={{ mt: 4 }}
          >
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Shopping Cart
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr",
            },
            gap: 3,
          }}
        >
          <Box>
            {items.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h6">
                        {item.title}
                      </Typography>

                      <Typography color="primary">
                        ₹{item.price.toLocaleString()}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        <RemoveIcon />
                      </IconButton>

                      <Typography>
                        {item.quantity}
                      </Typography>

                      <IconButton
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        <AddIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Card sx={{ height: "fit-content" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                Order Summary
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Subtotal</Typography>

                <Typography>
                  ₹{subtotal.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                }}
              >
                <Typography>Shipping</Typography>

                <Typography color="green">
                  FREE
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  Total
                </Typography>

                <Typography sx={{ fontWeight: 700 }}>
                  ₹{subtotal.toLocaleString()}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Footer />
    </>
  );
}