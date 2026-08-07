"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export default function Newsletter() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Stay Updated
        </Typography>

        <Typography
          sx={{
            mt: 2,
            mb: 4,
            color: "text.secondary",
          }}
        >
          Subscribe to receive exclusive offers, new arrivals and special discounts.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Enter your email"
            sx={{
              width: {
                xs: "100%",
                sm: 420,
              },
            }}
          />

          <Button
            variant="contained"
            size="large"
          >
            Subscribe
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}