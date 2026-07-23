"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ProductCarousel from "../products/ProductCarousel";
import deals from "@/data/deals";

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState(5 * 60 * 60); // 5 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 5 * 60 * 60));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 2,
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FlashOnIcon color="error" />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Flash Sale
            </Typography>

            <Typography
              sx={{
                color: "red",
                fontWeight: 700,
                ml: 2,
              }}
            >
              {hours}:{minutes}:{seconds}
            </Typography>
          </Box>

          <Button variant="contained">
            View All
          </Button>
        </Box>

        <ProductCarousel products={deals} />
      </Box>
    </Container>
  );
}