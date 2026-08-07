"use client";

import Image from "next/image";

import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

const brands = [
  { name: "Apple", image: "/logos/apple.png" },
  { name: "Samsung", image: "/logos/samsung.png" },
  { name: "Sony", image: "/logos/sony.png" },
  { name: "Nike", image: "/logos/nike.png" },
  { name: "Adidas", image: "/logos/adidas.png" },
  { name: "Dell", image: "/logos/dell.png" },
];

export default function BrandSection() {
  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 4,
        }}
      >
        Top Brands
      </Typography>

      <Grid container spacing={3}>
        {brands.map((brand) => (
          <Grid
            key={brand.name}
            size={{ xs: 6, sm: 4, md: 2 }}
          >
            <Paper
              elevation={2}
              sx={{
                height: 120,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: ".3s",

                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 100,
                  height: 50,
                }}
              >
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}