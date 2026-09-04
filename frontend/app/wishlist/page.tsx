"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
import useAuthStore from "@/store/authStore";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeAction = useWishlistStore((s) => s.remove);
  const fetchAll = useWishlistStore((s) => s.fetchAll);
  const token = useAuthStore((s) => s.token);

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const router = useRouter();

  /*
   * Load wishlist only after authentication is available.
   */
  useEffect(() => {
    if (token) {
      void fetchAll();
    }
  }, [token, fetchAll]);

  /*
   * Move wishlist item to cart.
   *
   * Important:
   * The wishlist backend stores products, while the cart backend
   * requires a concrete product variant.
   *
   * Therefore:
   *
   * 1. If no variant is available, open the product page.
   * 2. If a variant exists, add it to cart.
   * 3. Remove the wishlist item ONLY after successful cart addition.
   */
  const moveToCart = async (
    item: typeof items[number]
  ) => {
    const hasVariant =
      item.variantId !== undefined &&
      item.variantId !== null &&
      String(item.variantId).trim() !== "";

    /*
     * Wishlist item does not contain a usable variant.
     * Never manufacture a variant ID.
     */
    if (!hasVariant) {
      if (item.slug) {
        router.push(
          "/products/" +
            encodeURIComponent(item.slug)
        );
        return;
      }

      /*
       * Fallback when legacy wishlist metadata does not
       * contain the product slug.
       */
      router.push(
        "/products/" +
          encodeURIComponent(
            String(item.productId)
          )
      );

      return;
    }

    const result = await addToCart({
      productId: item.productId,
      slug: item.slug || "",
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: 1,
      variantId: item.variantId,
      variantLabel: item.variantLabel,
    });

    /*
     * Only remove the wishlist entry after the cart API
     * confirms that the item was added successfully.
     */
    if (result.ok === true) {
      await removeAction(item.productId);
    }
  };

  /*
   * Empty wishlist.
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
            sx={{ fontWeight: 700 }}
          >
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
          My Wishlist ({items.length})
        </Typography>

        {items.map((item) => (
          <Card
            key={item.wishlistId}
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
                  flexWrap: "wrap",
                }}
              >
                <Image
                  src={
                    item.image ||
                    "/placeholder.png"
                  }
                  alt={
                    item.title ||
                    "Wishlist item"
                  }
                  width={120}
                  height={120}
                  style={{
                    objectFit: "contain",
                  }}
                />

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 200,
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
                      fontWeight: 700,
                      mt: 1,
                    }}
                  >
                    ₹
                    {Number(
                      item.price || 0
                    ).toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="warning"
                  onClick={() =>
                    void moveToCart(item)
                  }
                >
                  Add To Cart
                </Button>

                <IconButton
                  color="error"
                  aria-label={
                    "Remove " +
                    (item.title ||
                      "item") +
                    " from wishlist"
                  }
                  onClick={() =>
                    void removeAction(
                      item.productId
                    )
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
