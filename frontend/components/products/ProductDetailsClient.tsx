"use client";

import { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  Box,
  Rating,
} from "@mui/material";
import Image from "next/image";

import useCartStore from "@/store/cartStore";
import { Product } from "@/types/product";

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    setIsAdding(true);

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        slug: product.slug,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity: 1,
      });
    }

    setIsAdding(false);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Later: redirect to checkout
    // router.push("/checkout");
  };

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <Grid container spacing={5}>
      {/* Product Image */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            background: "#fafafa",
            borderRadius: 3,
            p: 3,
          }}
        >
          <Image
            src={product.image}
            alt={product.title}
            width={400}
            height={400}
            style={{
              objectFit: "contain",
            }}
          />
        </Box>
      </Grid>

      {/* Product Info */}
      <Grid item xs={12} md={6}>
        <Typography variant="caption" color="text.secondary">
          {product.brand}
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
          {product.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
          <Rating
            value={product.rating}
            precision={0.5}
            readOnly
            size="medium"
          />
          <Typography color="text.secondary">
            {product.reviews} reviews
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h5"
            color="success.main"
            sx={{ fontWeight: 700 }}
          >
            ₹{product.price.toLocaleString()}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: "line-through",
                color: "text.secondary",
              }}
            >
              ₹{product.originalPrice.toLocaleString()}
            </Typography>
            <Typography
              sx={{
                color: "success.main",
                fontWeight: 700,
              }}
            >
              {discount}% off
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ mt: 3, color: "text.secondary" }}>
          {product.description}
        </Typography>

        <Typography sx={{ mt: 2 }}>
          {product.stock > 0 ? (
            <span style={{ color: "green", fontWeight: 700 }}>
              ✓ In Stock ({product.stock} available)
            </span>
          ) : (
            <span style={{ color: "red", fontWeight: 700 }}>
              Out of Stock
            </span>
          )}
        </Typography>

        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography>Quantity:</Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              borderRadius: 1,
            }}
          >
            <Button
              size="small"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity === 1}
            >
              −
            </Button>
            <Typography sx={{ px: 2, minWidth: "40px", textAlign: "center" }}>
              {quantity}
            </Typography>
            <Button
              size="small"
              onClick={() =>
                setQuantity(Math.min(product.stock, quantity + 1))
              }
              disabled={quantity >= product.stock}
            >
              +
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock === 0}
            sx={{ flex: 1 }}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleBuyNow}
            disabled={isAdding || product.stock === 0}
            sx={{ flex: 1 }}
          >
            Buy Now
          </Button>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #eee" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Highlights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ✓ Free Delivery on orders above ₹500
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ✓ 7-day returns & exchanges
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ✓ Secure payments
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}