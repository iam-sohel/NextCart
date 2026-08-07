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
} from "@mui/material";

import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import IconButton from "@mui/material/IconButton";

import useWishlistStore from "@/store/wishlistStore";

interface Props {
  product: any;
}

export default function ProductInfo({ product }: Props) {
  const {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} = useWishlistStore();

const liked = isInWishlist(product.id);
  return (
    <>
      {/* Brand */}
      <Typography
        color="primary"
        fontWeight={600}
      >
        {product.brand}
      </Typography>

      {/* Product Name */}
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ mt: 1 }}
      >
        {product.title}
      </Typography>

      {/* Rating */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mt: 2 }}
      >
        <Rating
          value={product.rating}
          precision={0.5}
          readOnly
        />

        <Typography fontWeight={600}>
          {product.rating}
        </Typography>

        <Typography color="text.secondary">
          ({product.reviews} Ratings)
        </Typography>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Price */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography
          variant="h3"
          color="primary"
          fontWeight={700}
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

      <Typography
        variant="h6"
        fontWeight={700}
      >
        Available Offers
      </Typography>

      <Stack spacing={2} mt={2}>
        <Stack direction="row" spacing={2}>
          <LocalOfferIcon color="success" />
          <Typography>
            10% Instant Discount on HDFC Credit Cards
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <LocalOfferIcon color="success" />
          <Typography>
            No Cost EMI Available
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <LocalOfferIcon color="success" />
          <Typography>
            ₹2,000 Exchange Bonus
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <LocalOfferIcon color="success" />
          <Typography>
            Free Delivery
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Highlights */}

      <Typography
        variant="h6"
        fontWeight={700}
      >
        Highlights
      </Typography>

      <Stack spacing={1} mt={2}>
        {product.highlights?.map(
          (item: string) => (
            <Typography key={item}>
              • {item}
            </Typography>
          )
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Delivery */}

      <Typography
        variant="h6"
        fontWeight={700}
      >
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
                <Button size="small">
                  Check
                </Button>
              </InputAdornment>
            ),
          },
        }}
      />

      <Stack
        direction="row"
        spacing={1}
        mt={2}
      >
        <LocalShippingIcon color="success" />

        <Typography color="success.main">
          {product.delivery}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        mt={1}
      >
        <CheckCircleIcon color="primary" />

        <Typography>
          {product.warranty}
        </Typography>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Stock */}

      <Typography
        color={
          product.stock > 5
            ? "success.main"
            : "error.main"
        }
        fontWeight={700}
      >
        {product.stock > 0
          ? `${product.stock} Items Left`
          : "Out of Stock"}
      </Typography>

      {/* Buttons */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        mt={4}
      >
        <Stack direction="row" spacing={2} mt={5}>
  <Button
    variant="contained"
    color="warning"
    size="large"
    onClick={() =>
      addToCart({
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity: 1,
      })
    }
  >
    Add To Cart
  </Button>

  <Button
    variant="contained"
    color="error"
    size="large"
  >
    Buy Now
  </Button>

  <IconButton
    color="error"
    sx={{
      border: "1px solid #ddd",
    }}
    onClick={() =>
      liked
        ? removeFromWishlist(product.id)
        : addToWishlist({
            id: product.id,
            title: product.title,
            image: product.image,
            price: product.price,
            slug: product.slug,
          })
    }
  >
    {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
  </IconButton>
</Stack>
      </Stack>

      {/* Seller */}

      <Paper
        elevation={1}
        sx={{
          p: 3,
          mt: 5,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Seller
        </Typography>

        <Typography
          sx={{ mt: 1 }}
          color="primary"
        >
          NextCart Retail Pvt Ltd
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1 }}
        >
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