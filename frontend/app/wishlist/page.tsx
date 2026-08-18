"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Box,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import useWishlistStore from "@/store/wishlistStore";
import useCartStore from "@/store/cartStore";

export default function WishlistPage() {
  const {
    items,
    removeFromWishlist,
  } = useWishlistStore();

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const moveToCart = (item: typeof items[number]) => {
    addToCart({
      id: item.id,
      slug: item.slug,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: 1,
      variantId: item.variantId,
      variantLabel: item.variantLabel,
    });
    removeFromWishlist(item.id);
  };

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
            Your Wishlist is Empty
          </Typography>

          <Typography
            sx={{
              mt: 2,
              color: "text.secondary",
            }}
          >
            Save products you love and buy them later.
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

      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 4 }}
        >
          My Wishlist ({items.length})
        </Typography>

        {items.map((item) => (
          <Card
            key={item.id}
            sx={{
              mb: 3,
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={120}
                  height={120}
                  style={{
                    objectFit: "contain",
                  }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    {item.title}
                  </Typography>

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
                    sx={{ fontWeight: 700, mt: 1 }}
                  >
                    ₹{item.price.toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => moveToCart(item)}
                >
                  Add To Cart
                </Button>

                <IconButton
                  color="error"
                  onClick={() =>
                    removeFromWishlist(item.id)
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Container>

      <Footer />
    </>
  );
}