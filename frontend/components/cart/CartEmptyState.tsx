"use client";

import Link from "next/link";

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

/**
 * NEXTCART — CartEmptyState
 *
 * Empty-cart experience. Shows a clear message with a primary CTA back
 * to the catalogue. If a cart error was present (e.g. the backend could
 * not be reached) it is surfaced here too — failures are never hidden —
 * alongside a retry action when the caller provides one.
 */
export default function CartEmptyState({
  error,
  onDismissError,
  onRetry,
}: {
  error?: string | null;
  onDismissError?: () => void;
  onRetry?: () => void;
}) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        elevation={0}
        sx={{
          textAlign: "center",
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 8 },
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: 88,
            height: 88,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            bgcolor: "action.hover",
          }}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 40, color: "text.secondary" }} />
        </Box>

        <Typography
          component="h1"
          sx={{ mt: 3, fontWeight: 700, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
        >
          Your cart is empty
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1.5, maxWidth: 380, mx: "auto" }}
        >
          Looks like you haven&apos;t added anything yet. Explore the catalogue
          and find something you love.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 4, justifyContent: "center" }}
        >
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outlined"
              size="large"
              sx={{ px: 4, borderRadius: 2, minHeight: 44 }}
            >
              Try Again
            </Button>
          )}
          <Button
            component={Link}
            href="/products"
            variant="contained"
            size="large"
            sx={{ px: 4, borderRadius: 2, minHeight: 44 }}
          >
            Continue Shopping
          </Button>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            size="large"
            sx={{ px: 4, borderRadius: 2, minHeight: 44 }}
          >
            Go to Home
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          onClose={onDismissError}
          sx={{ mt: 3, textAlign: "left" }}
        >
          {error}
        </Alert>
      )}
    </Container>
  );
}
