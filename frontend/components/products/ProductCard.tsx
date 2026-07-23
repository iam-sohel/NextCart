"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Rating,
} from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  offer: string;
}

export default function ProductCard({
  image,
  title,
  price,
  offer,
}: ProductCardProps) {
  return (
    <Card
      sx={{
        width: 240,
        borderRadius: 3,
        transition: "0.3s",
        position: "relative",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 8,
        },
      }}
    >
      <IconButton
        sx={{
          position: "absolute",
          right: 10,
          top: 10,
          bgcolor: "#fff",
        }}
      >
        <FavoriteBorderIcon />
      </IconButton>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Image
          src={image}
          alt={title}
          width={170}
          height={170}
          style={{
            objectFit: "contain",
          }}
        />
      </Box>

      <CardContent>
        <Typography
          noWrap
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
          }}
        >
          <Rating
            value={4.5}
            precision={0.5}
            size="small"
            readOnly
          />

          <Typography variant="body2">
            (264)
          </Typography>
        </Box>

        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', mt: 1 }}
        >
          {price}
        </Typography>

        <Chip
          label={offer}
          color="success"
          size="small"
          sx={{ mt: 1 }}
        />

        <Typography sx={{ color: 'green', mt: 1, fontSize: 14 }}>
          Free Delivery
        </Typography>

        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartIcon />}
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