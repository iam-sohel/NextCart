"use client";

import Image from "next/image";
import categories from "@/data/categories";

import {
  Container,
  Typography,
  Grid,
  Paper,
} from "@mui/material";

export default function Categories() {
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 4,
        }}
      >
        Shop by Category
      </Typography>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid
            key={category.slug}
            size={{
              xs: 6,
              sm: 4,
              md: 3,
              lg: 2,
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                transition: ".3s",
                borderRadius: 3,

                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 8,
                },
              }}
            >
              <Image
                src={category.image}
                alt={category.title}
                width={70}
                height={70}
              />

              <Typography
                sx={{
                  mt: 2,
                  fontWeight: 600,
                }}
              >
                {category.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}