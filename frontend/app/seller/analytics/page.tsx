"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import useAuthStore from "@/store/authStore";
import StatusChip, { humanizeStatus } from "@/components/seller/StatusChip";
import {
  SellerEmptyState,
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";
import {
  getSellerAnalytics,
  type SellerAnalyticsResponse,
} from "@/services/sellerAnalyticsService";
import { formatAmount, formatCount } from "@/utils/formatAmount";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function firstDayOfMonth(): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function isISODate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Grid>
  );
}

export default function SellerAnalyticsPage() {
  const token = useAuthStore((s) => s.token);

  const [fromInput, setFromInput] = useState(firstDayOfMonth);
  const [toInput, setToInput] = useState(() => toISODate(new Date()));
  const [applied, setApplied] = useState(() => ({
    from: firstDayOfMonth(),
    to: toISODate(new Date()),
  }));

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<SellerAnalyticsResponse | null>(
    null,
  );

  const rangeError = useMemo(() => {
    if (!isISODate(fromInput) || !isISODate(toInput)) {
      return "Enter valid start and end dates in YYYY-MM-DD format.";
    }
    if (fromInput > toInput) {
      return "The start date must be on or before the end date.";
    }
    return null;
  }, [fromInput, toInput]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);

    const result = await getSellerAnalytics(applied, signal);

    if (signal?.aborted) return;

    if (!result.ok) {
      setAnalytics(null);
      setLoading(false);
      setLoadError(result.message);
      return;
    }

    setAnalytics(result.data);
    setLoading(false);
  }, [applied]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      if (cancelled) return;
      await load(controller.signal);
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [token, load]);

  const applyRange = () => {
    if (rangeError || loading) return;
    setApplied({ from: fromInput, to: toInput });
  };

  if (loading) {
    return <SellerPageSkeleton cards={4} />;
  }

  if (loadError || !analytics) {
    return (
      <SellerErrorState
        message={loadError ?? "Could not load analytics."}
        onRetry={() => void load()}
      />
    );
  }

  const statusEntries = Object.entries(
    analytics.orders?.statusCounts ?? {},
  ).sort(([first], [second]) => first.localeCompare(second));

  const maxDailySales = Math.max(
    0,
    ...analytics.dailySales.map((day) => day.sales ?? 0),
  );

  const hasActivity =
    (analytics.overview?.totalOrders ?? 0) > 0 ||
    analytics.dailySales.length > 0 ||
    analytics.topProducts.length > 0;

  return (
    <div>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Analytics
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Server-calculated performance for{" "}
        {analytics.from && analytics.to
          ? `${analytics.from} to ${analytics.to}`
          : "the selected range"}
        .
      </Typography>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Grid container spacing={2} sx={{ alignItems: "flex-end" }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="From"
                type="date"
                value={fromInput}
                onChange={(event) => setFromInput(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="To"
                type="date"
                value={toInput}
                onChange={(event) => setToInput(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={applyRange}
                disabled={
                  loading ||
                  Boolean(rangeError) ||
                  (fromInput === applied.from && toInput === applied.to)
                }
              >
                Apply range
              </Button>
            </Grid>
          </Grid>

          {rangeError ? (
            <Typography variant="body2" color="error" sx={{ mt: 2 }} role="alert">
              {rangeError}
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      <Stack spacing={3}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Overview
            </Typography>

            <Grid container spacing={3}>
              <OverviewStat
                label="Total sales"
                value={formatAmount(analytics.overview?.totalSales)}
              />
              <OverviewStat
                label="Orders"
                value={formatCount(analytics.overview?.totalOrders)}
              />
              <OverviewStat
                label="Units sold"
                value={formatCount(analytics.overview?.totalUnitsSold)}
              />
              <OverviewStat
                label="Average order value"
                value={formatAmount(analytics.overview?.averageOrderValue)}
              />
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Orders by status
            </Typography>

            {statusEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No order statuses were returned for this range.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {statusEntries.map(([status, count]) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={status}>
                    <StatusChip status={status} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                      {formatCount(count)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {humanizeStatus(status)}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Products and inventory
            </Typography>

            <Grid container spacing={3}>
              <OverviewStat
                label="Products"
                value={formatCount(analytics.products?.totalProducts)}
              />
              <OverviewStat
                label="Active products"
                value={formatCount(analytics.products?.activeProducts)}
              />
              <OverviewStat
                label="Inactive products"
                value={formatCount(analytics.products?.inactiveProducts)}
              />
              <OverviewStat
                label="Inventory items"
                value={formatCount(analytics.inventory?.totalItems)}
              />
              <OverviewStat
                label="Available stock"
                value={formatCount(analytics.inventory?.availableStock)}
              />
              <OverviewStat
                label="Reserved stock"
                value={formatCount(analytics.inventory?.reservedStock)}
              />
              <OverviewStat
                label="Low-stock items"
                value={formatCount(analytics.inventory?.lowStockItems)}
              />
              <OverviewStat
                label="Out-of-stock items"
                value={formatCount(analytics.inventory?.outOfStockItems)}
              />
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Daily sales
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Real daily totals supplied by the backend.
            </Typography>

            {analytics.dailySales.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No daily sales were returned for this range.
              </Typography>
            ) : (
              <Box
                component="ul"
                sx={{ listStyle: "none", m: 0, p: 0 }}
              >
                {analytics.dailySales.map((day, index) => {
                  const sales = day.sales ?? 0;
                  const width =
                    maxDailySales > 0
                      ? Math.max(2, Math.round((sales / maxDailySales) * 100))
                      : 0;

                  return (
                    <Box
                      component="li"
                      key={`${day.date ?? "unknown"}-${index}`}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "86px minmax(0, 1fr)",
                          sm: "116px minmax(0, 1fr) auto",
                        },
                        gap: 1.5,
                        alignItems: "center",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {day.date ?? "—"}
                      </Typography>
                      <Box
                        aria-hidden="true"
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          bgcolor: "action.hover",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${width}%`,
                            height: "100%",
                            bgcolor: "primary.main",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ display: { xs: "none", sm: "block" } }}
                      >
                        {formatAmount(day.sales)} · {formatCount(day.unitsSold)}{" "}
                        units
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: { xs: "block", sm: "none" } }}
                      >
                        {formatAmount(day.sales)} · {formatCount(day.unitsSold)}{" "}
                        units
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Top products
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Ranked by the backend; no client-side ranking is applied.
            </Typography>

            {analytics.topProducts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No top products were returned for this range.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {analytics.topProducts.map((product, index) => (
                  <Box
                    key={`${product.productId ?? "unknown"}-${index}`}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {index + 1}. {product.productName || "Product"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatCount(product.unitsSold)} units ·{" "}
                      {formatAmount(product.sales)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {!hasActivity ? (
          <SellerEmptyState
            title="No analytics data for this range"
            description="Zero values are valid. Choose a wider date range when sales activity exists."
          />
        ) : null}
      </Stack>
    </div>
  );
}
