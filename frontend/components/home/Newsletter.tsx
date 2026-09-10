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
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3.5, md: 5 },
          borderRadius: 4,
          textAlign: "center",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 1,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
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
            disableElevation
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 700,
              textTransform: "none",
              px: 4,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "primary.dark",
                boxShadow: "none",
              },
            }}
          >
            Subscribe
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}