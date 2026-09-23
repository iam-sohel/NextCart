"use client";

import Link from "next/link";

import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import PageHeader from "@/components/ops/PageHeader";

/**
 * NEXTCART — Seller products.
 *
 * The backend currently exposes ONLY product creation for sellers
 * (POST /api/v1/sellers/products). There is no list / detail / update /
 * delete endpoint, so this page does not render a product table.
 */
export default function SellerProductsPage() {
  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle="Create products for your NextCart catalogue."
        actions={
          <Button
            component={Link}
            href="/seller/products/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ minHeight: 44 }}
          >
            Add product
          </Button>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Inventory2Icon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Add a product
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Provide the product details, variants, pricing and images.
            </Typography>

            <Button
              component={Link}
              href="/seller/products/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ minHeight: 44 }}
            >
              Add product
            </Button>
          </CardContent>
        </Card>

        <Alert severity="info">
          Product listing, editing, deletion and activation are not available
          in the current backend. Only product creation is supported, so the
          catalogue cannot yet be managed from this panel.
        </Alert>
      </Stack>
    </Box>
  );
}
