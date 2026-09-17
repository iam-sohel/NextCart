"use client";

import Link from "next/link";

import { Box, Button, Card, CardContent, Typography } from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import useAuthStore from "@/store/authStore";

/**
 * NEXTCART — Seller dashboard (Module 1 foundation).
 *
 * Intentionally a clean foundation page: no placeholder analytics, counters or
 * charts. It links only to routes that actually exist.
 */
export default function SellerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName?.trim();

  return (
    <Box>
      <Typography
        variant="h3"
        component="h2"
        sx={{ fontWeight: 700, mb: 0.5 }}
      >
        Seller Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome{firstName ? `, ${firstName}` : ""}. Manage your seller account
        from one place.
      </Typography>

      <Card sx={{ borderRadius: 3, maxWidth: 560 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
            }}
          >
            <StorefrontIcon color="primary" />

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Seller Profile
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View your seller details and update your business name.
          </Typography>

          <Button
            component={Link}
            href="/seller/profile"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
          >
            Go to Profile
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
