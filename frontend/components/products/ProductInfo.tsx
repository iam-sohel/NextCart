"use client";

import {
  Typography,
  Stack,
  Button,
  Chip,
  Rating,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";

import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";

import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export default function ProductInfo({ product }: Props) {
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  const addToCart = useCartStore((state) => state.addToCart);

  const liked = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity: 1,
    });
  };

  const handleWishlistToggle = () => {
    if (liked) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        slug: product.slug,
      });
    }
  };

  return (
    <>
      {/* Brand */}
      <Typography color="primary" sx={{ fontWeight: 600 }}>
        {product.brand}
      </Typography>

      {/* Product Name */}
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
        {product.title}
      </Typography>

      {/* Rating */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 2, alignItems: "center" }}
      >
        <Rating value={product.rating} precision={0.5} readOnly />

        <Typography sx={{ fontWeight: 600 }}>
          {product.rating}
        </Typography>

        <Typography color="text.secondary">
          ({product.reviews} Ratings)
        </Typography>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Price */}
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography
          variant="h3"
          color="primary"
          sx={{ fontWeight: 700 }}
        >
          ₹{product.price.toLocaleString()}
        </Typography>

        <Chip
          color="success"
          label={`${product.discount}% OFF`}
        />
      </Stack>

      <Typography
        sx={{
          mt: 1,
          textDecoration: "line-through",
          color: "gray",
        }}
      >
        MRP ₹{product.originalPrice.toLocaleString()}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Offers */}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Available Offers
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2}>
          <LocalOfferIcon color="success" />
          <Typography>10% Instant Discount on HDFC Credit Cards</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <LocalOfferIcon color="success" />
          <Typography>No Cost EMI Available</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <LocalOfferIcon color="success" />
          <Typography>₹2,000 Exchange Bonus</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <LocalOfferIcon color="success" />
          <Typography>Free Delivery</Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Highlights */}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Highlights
      </Typography>

      <Stack spacing={1} sx={{ mt: 2 }}>
        {product.highlights?.map((item: string) => (
          <Typography key={item}>• {item}</Typography>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Delivery */}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Delivery
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder="Enter Pincode"
        sx={{ mt: 2 }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Button size="small">Check</Button>
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <LocalShippingIcon color="success" />
        <Typography color="success.main">{product.delivery}</Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <CheckCircleIcon color="primary" />
        <Typography>{product.warranty}</Typography>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Stock */}
      <Typography
        color={product.stock > 5 ? "success.main" : "error.main"}
        sx={{ fontWeight: 700 }}
      >
        {product.stock > 0
          ? `${product.stock} Items Left`
          : "Out of Stock"}
      </Typography>

      {/* Buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mt: 4 }}
      >
        <Button
          variant="contained"
          color="warning"
          size="large"
          onClick={handleAddToCart}
        >
          Add To Cart
        </Button>

        <Button variant="contained" color="error" size="large">
          Buy Now
        </Button>

        <IconButton
          color="error"
          sx={{ border: "1px solid #ddd" }}
          onClick={handleWishlistToggle}
        >
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Stack>

      {/* Seller */}
      <Paper elevation={1} sx={{ p: 3, mt: 5, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Seller
        </Typography>

        <Typography sx={{ mt: 1 }} color="primary">
          NextCart Retail Pvt Ltd
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          ✔ Genuine Products
        </Typography>

        <Typography color="text.secondary">
          ✔ 7 Days Replacement
        </Typography>

        <Typography color="text.secondary">
          ✔ GST Invoice Available
        </Typography>
      </Paper>
    </>
  );
}
