"use client";

import {
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

const brands = ["Apple", "Samsung", "Sony", "Nike", "Adidas", "Dell"] as const;

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
            key={brand}
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
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, textAlign: "center" }}
              >
                {brand}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}