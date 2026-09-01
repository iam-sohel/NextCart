 "use client";

import { Container, Grid, Paper, Typography } from "@mui/material";

const promos = [
  {
    title: "Free Shipping",
    subtitle: "On orders above ₹999",
    color: "#2563EB",
  },
  {
    title: "Secure Payments",
    subtitle: "100% Safe & Encrypted",
    color: "#059669",
  },
  {
    title: "Easy Returns",
    subtitle: "7-Day Return Policy",
    color: "#EA580C",
  },
];

export default function PromoBanner() {
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Grid container spacing={3}>
        {promos.map((promo) => (
          <Grid size={{ xs: 12, md: 4 }} key={promo.title}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                color: "#fff",
                background: promo.color,
                transition: ".3s",
                cursor: "pointer",

                "&:hover": {
                  transform: "translateY(-6px)",
                },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {promo.title}
              </Typography>

              <Typography sx={{ mt: 1 }}>
                {promo.subtitle}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}