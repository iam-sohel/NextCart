"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  IconButton,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

interface ProductCardProps {
  slug: string;
  image: string;
  title: string;
  price: string;
  offer: string;
  rating?: number;
  brand?: string;
}

export default function ProductCard({
  slug,
  image,
  title,
  price,
  offer,
  rating = 4.5,
  brand = "NextCart",
}: ProductCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transition: ".3s",

        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 8,
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Link
          href={`/products/${slug}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Box
            sx={{
              height: 220,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#fafafa",
            }}
          >
            <Image
              src={image}
              alt={title}
              width={170}
              height={170}
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Link>

        <Chip
          label={offer}
          color="error"
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            fontWeight: 700,
          }}
        />

        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "#fff",
          }}
        >
          <FavoriteBorderIcon />
        </IconButton>
      </Box>

      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {brand}
        </Typography>

        <Typography
          sx={{
            fontWeight: 600,
            mt: .5,
            minHeight: 48,
          }}
        >
          {title}
        </Typography>

        <Rating
          value={rating}
          precision={0.5}
          readOnly
          size="small"
          sx={{ my: 1 }}
        />

        <Typography
          variant="h6"
          sx={{ fontWeight: 700 }}
        >
          {price}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}