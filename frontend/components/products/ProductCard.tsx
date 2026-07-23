"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";

interface Props {
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
}: Props) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box
        sx={{
          height: 220,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "170px",
            height: "170px",
            objectFit: "contain",
          }}
        />
      </Box>

      <CardContent>
        <Typography sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Typography
          variant="h6"
          sx={{ mt: 1 }}
        >
          {price}
        </Typography>

        <Typography color="success.main">
          {offer}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}