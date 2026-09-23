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
import PageHeader from "@/components/ops/PageHeader";
import StatCard from "@/components/ops/StatCard";
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

  const orderStatuses: Array<[string, number | null | undefined]> = [
    ["Total", dashboard.orders?.total],
    ["Pending", dashboard.orders?.pending],
    ["Confirmed", dashboard.orders?.confirmed],
    ["Processing", dashboard.orders?.processing],
    ["Shipped", dashboard.orders?.shipped],
    ["Delivered", dashboard.orders?.delivered],
    ["Cancelled", dashboard.orders?.cancelled],
    ["Return requested", dashboard.orders?.returnRequested],
    ["Return approved", dashboard.orders?.returnApproved],
    ["Returned", dashboard.orders?.returned],
    ["Refunded", dashboard.orders?.refunded],
  ];

  const inventoryStats: Array<[string, number | null | undefined]> = [
    ["Products", dashboard.products?.total],
    ["Active products", dashboard.products?.active],
    ["Inactive products", dashboard.products?.inactive],
    ["Inventory items", dashboard.inventory?.totalItems],
    ["Low-stock items", dashboard.inventory?.lowStockItems],
    ["Out-of-stock items", dashboard.inventory?.outOfStockItems],
  ];

  return (
    <Box>
      <PageHeader
        title="Seller Dashboard"
        subtitle="Overview of your NextCart seller account."
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: -2, mb: 3 }}
      >
        Generated {generatedAt}
      </Typography>

      <Stack spacing={3}>
        {/* ── Sales KPIs ──────────────────────────────────────────── */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              icon={<PaymentsIcon />}
              value={formatAmount(dashboard.sales?.totalSalesAmount)}
              label="Total sales"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              icon={<ShoppingBagIcon />}
              value={formatAmount(dashboard.sales?.deliveredSalesAmount)}
              label="Delivered sales"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              value={formatAmount(dashboard.sales?.refundedSalesAmount)}
              label="Refunded sales"
            />
          </Grid>
        </Grid>

        {/* ── Business ────────────────────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {seller?.businessName || "Your business"}
              </Typography>
              <Stack direction="row" spacing={1}>
                <StatusChip
                  status={seller?.verified ? "VERIFIED" : "PENDING"}
                  label={seller?.verified ? "Verified" : "Not verified"}
                />
                <StatusChip
                  status={seller?.active ? "ACTIVE" : "INACTIVE"}
                  label={seller?.active ? "Active" : "Inactive"}
                />
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Keep your verification, bank details and inventory up to date to
              avoid payout or fulfilment delays.
            </Typography>
          </CardContent>
        </Card>

        {/* ── Orders ──────────────────────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ShoppingBagIcon color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Orders
                </Typography>
              </Stack>
              <Button
                component={Link}
                href="/seller/orders"
                variant="text"
                size="small"
              >
                View orders
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {orderStatuses.map(([label, value]) => (
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
          </CardContent>
        </Card>

        {/* ── Products and inventory ──────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Inventory2Icon color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Products and inventory
                </Typography>
              </Stack>
              <Button
                component={Link}
                href="/seller/products/new"
                variant="text"
                size="small"
              >
                Add product
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {inventoryStats.map(([label, value]) => (
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
          </CardContent>
        </Card>

        {/* ── Verification ────────────────────────────────────────── */}
        <Card>
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

        {/* ── Warehouses ──────────────────────────────────────────── */}
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AddBusinessIcon color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Warehouses
                </Typography>
              </Stack>
              <Button
                component={Link}
                href="/seller/warehouses"
                variant="text"
                size="small"
              >
                {dashboard.warehouses?.total === 0 ? "Add warehouse" : "Manage"}
              </Button>
            </Stack>

            {dashboard.warehouses?.total === 0 ? (
              <Typography variant="body2" color="text.secondary">
                You have no warehouses yet. Add one to start fulfilling
                orders.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {(
                  [
                    ["Total", dashboard.warehouses?.total],
                    ["Active", dashboard.warehouses?.active],
                    ["Inactive", dashboard.warehouses?.inactive],
                  ] as Array<[string, number | null | undefined]>
                ).map(([label, value]) => (
                  <Grid size={{ xs: 4 }} key={label}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCount(value)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* ── Quick actions ───────────────────────────────────────── */}
        <Card>
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
