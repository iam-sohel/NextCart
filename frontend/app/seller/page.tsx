"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BarChartIcon from "@mui/icons-material/BarChart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PaymentsIcon from "@mui/icons-material/Payments";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

import useAuthStore from "@/store/authStore";
import StatusChip from "@/components/seller/StatusChip";
import {
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";
import {
  getSellerDashboard,
  type SellerDashboardResponse,
} from "@/services/sellerDashboardService";
import {
  formatAmount,
  formatCount,
  formatDateTime,
} from "@/utils/formatAmount";

/**
 * NEXTCART — Seller dashboard.
 *
 * Consumes the single aggregate endpoint `GET /api/v1/sellers/dashboard`.
 * Every displayed total is supplied by the backend; this page only arranges
 * and labels the authoritative response.
 */
export default function SellerDashboardPage() {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<SellerDashboardResponse | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const res = await getSellerDashboard();

    if (!res.ok) {
      setDashboard(null);
      setLoading(false);
      setLoadError(res.message);
      return;
    }

    setDashboard(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await load();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token, load]);

  if (loading) {
    return <SellerPageSkeleton cards={4} />;
  }

  if (loadError || !dashboard) {
    return (
      <SellerErrorState
        message={loadError ?? "Could not load your seller dashboard."}
        onRetry={() => void load()}
      />
    );
  }

  const seller = dashboard.seller;
  const generatedAt = formatDateTime(dashboard.generatedAt);

  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Seller Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Overview of your NextCart seller account.
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: "block" }}>
        Generated {generatedAt}
      </Typography>

      <Stack spacing={3}>
        {/* ── Business overview ─────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Business
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Business name
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.25 }}>
                  {seller?.businessName || "—"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Verified
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip
                    status={seller?.verified ? "VERIFIED" : "PENDING"}
                    label={seller?.verified ? "Verified" : "Not verified"}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Account
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip
                    status={seller?.active ? "ACTIVE" : "INACTIVE"}
                    label={seller?.active ? "Active" : "Inactive"}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Sales ─────────────────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Sales
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatAmount(dashboard.sales?.totalSalesAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total sales
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatAmount(dashboard.sales?.deliveredSalesAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Delivered sales
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatAmount(dashboard.sales?.refundedSalesAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Refunded sales
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Orders ────────────────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2 }}
            >
              <ShoppingBagIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Orders
              </Typography>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              {(
                [
                  ["Total", dashboard.orders?.total],
                  ["Pending", dashboard.orders?.pending],
                  ["Confirmed", dashboard.orders?.confirmed],
                  ["Processing", dashboard.orders?.processing],
                  ["Shipped", dashboard.orders?.shipped],
                  ["Delivered", dashboard.orders?.delivered],
                ] as Array<[string, number | null | undefined]>
              ).map(([label, value]) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={label}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatCount(value)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {(
                [
                  ["Cancelled", dashboard.orders?.cancelled],
                  ["Return requested", dashboard.orders?.returnRequested],
                  ["Return approved", dashboard.orders?.returnApproved],
                  ["Returned", dashboard.orders?.returned],
                  ["Refunded", dashboard.orders?.refunded],
                ] as Array<[string, number | null | undefined]>
              ).map(([label, value]) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={label}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {formatCount(value)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Button
              component={Link}
              href="/seller/orders"
              variant="outlined"
            >
              View orders
            </Button>
          </CardContent>
        </Card>

        {/* ── Products and inventory ────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2 }}
            >
              <Inventory2Icon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Products and inventory
              </Typography>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {(
                [
                  ["Products", dashboard.products?.total],
                  ["Active products", dashboard.products?.active],
                  ["Inactive products", dashboard.products?.inactive],
                  ["Inventory items", dashboard.inventory?.totalItems],
                  ["Low-stock items", dashboard.inventory?.lowStockItems],
                  ["Out-of-stock items", dashboard.inventory?.outOfStockItems],
                ] as Array<[string, number | null | undefined]>
              ).map(([label, value]) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={label}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatCount(value)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Button
              component={Link}
              href="/seller/products/new"
              variant="outlined"
            >
              Add product
            </Button>
          </CardContent>
        </Card>

        {/* ── Verification ──────────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Verification
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    KYC
                  </Typography>
                  <StatusChip
                    status={dashboard.verification?.kycStatus}
                    label={
                      dashboard.verification?.kycStatus
                        ? undefined
                        : "Unavailable"
                    }
                  />
                </Stack>

                <Button
                  component={Link}
                  href="/seller/kyc"
                  size="small"
                  variant="outlined"
                >
                  Manage KYC
                </Button>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Bank account
                  </Typography>
                  <StatusChip
                    status={dashboard.verification?.bankStatus}
                    label={
                      dashboard.verification?.bankStatus
                        ? undefined
                        : "Unavailable"
                    }
                  />
                </Stack>

                <Button
                  component={Link}
                  href="/seller/bank"
                  size="small"
                  variant="outlined"
                >
                  Manage bank account
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Warehouses ────────────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2 }}
            >
              <AddBusinessIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Warehouses
              </Typography>
            </Stack>

            {dashboard.warehouses?.total === 0 ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  You have no warehouses yet. Add one to start fulfilling
                  orders.
                </Typography>
                <Button
                  component={Link}
                  href="/seller/warehouses"
                  variant="contained"
                >
                  Add warehouse
                </Button>
              </>
            ) : (
              <>
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCount(dashboard.warehouses?.total)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCount(dashboard.warehouses?.active)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCount(dashboard.warehouses?.inactive)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Inactive
                    </Typography>
                  </Grid>
                </Grid>

                <Button
                  component={Link}
                  href="/seller/warehouses"
                  variant="outlined"
                >
                  Manage warehouses
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Quick actions ─────────────────────────────────────────── */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Quick actions
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              <Button
                component={Link}
                href="/seller/products/new"
                variant="contained"
                startIcon={<Inventory2Icon />}
              >
                Add product
              </Button>
              <Button
                component={Link}
                href="/seller/orders"
                variant="outlined"
                startIcon={<ShoppingBagIcon />}
              >
                View orders
              </Button>
              <Button
                component={Link}
                href="/seller/analytics"
                variant="outlined"
                startIcon={<BarChartIcon />}
              >
                View analytics
              </Button>
              <Button
                component={Link}
                href="/seller/earnings"
                variant="outlined"
                startIcon={<PaymentsIcon />}
              >
                View earnings
              </Button>
              <Button
                component={Link}
                href="/seller/profile"
                variant="outlined"
              >
                Edit profile
              </Button>
              <Button
                component={Link}
                href="/seller/settings"
                variant="outlined"
              >
                Account settings
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
