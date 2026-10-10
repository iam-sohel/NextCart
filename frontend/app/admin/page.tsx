
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { useRouter } from "next/navigation";

import PageHeader from "@/components/ops/PageHeader";
import { AdminErrorState } from "@/components/admin/AdminStates";
import AdminTableSkeletonRows from "@/components/admin/AdminTableSkeletonRows";

import {
  getAdminDashboardRecentOrders,
  getAdminDashboardSummary,
  type AdminDashboardSummary,
} from "@/services/adminDashboardService";

import type { AdminOrder } from "@/services/adminOrderService";

interface MetricCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  description: string;
  loading: boolean;
  onClick: () => void;
  actionLabel: string;
  accent: "primary" | "warning" | "success" | "info";
}

const ACCENT_STYLES = {
  primary: {
    backgroundColor: "primary.main",
    color: "primary.contrastText",
  },
  warning: {
    backgroundColor: "warning.main",
    color: "warning.contrastText",
  },
  success: {
    backgroundColor: "success.main",
    color: "success.contrastText",
  },
  info: {
    backgroundColor: "info.main",
    color: "info.contrastText",
  },
} as const;

function formatMetric(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "Ã¢â‚¬â€";
  }

  return value.toLocaleString("en-IN");
}

function MetricCard({
  title,
  value,
  icon,
  description,
  loading,
  onClick,
  actionLabel,
  accent,
}: MetricCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
        "&:focus-within": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        aria-label={actionLabel}
        sx={{
          height: "100%",
          borderRadius: 3,
          "& .MuiCardActionArea-focusHighlight": {
            opacity: 0.04,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {title}
              </Typography>

              {loading ? (
                <Skeleton
                  variant="text"
                  width={104}
                  height={48}
                  sx={{ mt: 0.5 }}
                />
              ) : (
                <Typography
                  variant="h4"
                  component="p"
                  sx={{
                    mt: 0.75,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.2,
                    overflowWrap: "anywhere",
                  }}
                >
                  {formatMetric(value)}
                </Typography>
              )}

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.5 }}
              >
                {description}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                ...ACCENT_STYLES[accent],
              }}
            >
              {icon}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mt: 2,
              color: "text.secondary",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              View details
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 15 }} aria-hidden="true" />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Ã¢â‚¬â€";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAmount(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  const currencyCode = currency || "INR";

  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "Ã¢â‚¬â€";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

function getStatusPresentation(status: string | null | undefined) {
  const normalized = (status || "").trim().toUpperCase();

  if (["DELIVERED", "COMPLETED", "SUCCESS", "PAID"].includes(normalized)) {
    return { label: normalized, color: "success" as const };
  }

  if (["CANCELLED", "CANCELED", "FAILED", "REJECTED"].includes(normalized)) {
    return { label: normalized, color: "error" as const };
  }

  if (
    ["PENDING", "PROCESSING", "AWAITING_PAYMENT", "UNDER_REVIEW"].includes(
      normalized,
    )
  ) {
    return { label: normalized, color: "warning" as const };
  }

  if (!normalized) {
    return { label: "Unknown", color: "default" as const };
  }

  return { label: normalized.replaceAll("_", " "), color: "info" as const };
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // A monotonically increasing request ID prevents stale requests from
  // overwriting newer refresh results and prevents updates after unmount.
  const requestIdRef = useRef(0);

  const loadDashboard = useCallback(async () => {
    const requestId = ++requestIdRef.current;


    try {
      const [dashboardSummary, orders] = await Promise.all([
        getAdminDashboardSummary(),
        getAdminDashboardRecentOrders(),
      ]);

      if (requestId !== requestIdRef.current) return;

      setSummary(dashboardSummary);
      setRecentOrders(orders);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setSummary(null);
      setRecentOrders([]);
      setError(
        err instanceof Error && err.message.trim()
          ? err.message
          : "Unable to load the admin dashboard. Please try again.",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refreshDashboard = useCallback(() => {
    setLoading(true);
    setError("");
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;

    const run = async () => {
      try {
        const [dashboardSummary, orders] = await Promise.all([
          getAdminDashboardSummary(),
          getAdminDashboardRecentOrders(),
        ]);

        if (cancelled || requestId !== requestIdRef.current) return;

        setSummary(dashboardSummary);
        setRecentOrders(orders);
        setError("");
      } catch (err) {
        if (cancelled || requestId !== requestIdRef.current) return;

        setSummary(null);
        setRecentOrders([]);
        setError(
          err instanceof Error && err.message.trim()
            ? err.message
            : "Unable to load the admin dashboard. Please try again.",
        );
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;

      if (requestIdRef.current === requestId) {
        requestIdRef.current += 1;
      }
    };
  }, []);

  const openOrder = useCallback(
    (orderId: AdminOrder["id"]) => {
      router.push(`/admin/orders/${orderId}`);
    },
    [router],
  );

  const showEmptyOrders = !loading && !error && recentOrders.length === 0;

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader
        title="Admin Console"
        subtitle="Monitor marketplace activity and manage daily operations."
        rowBreakpoint="md"
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { setLoading(true); setError(""); void loadDashboard(); }}
            disabled={loading}
            sx={{ minHeight: 44, flexShrink: 0, borderRadius: 2 }}
          >
            {loading ? "RefreshingÃ¢â‚¬Â¦" : "Refresh"}
          </Button>
        }
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: -1,
          mb: 3,
          color: "text.secondary",
        }}
      >
        <TrendingUpIcon sx={{ fontSize: 18 }} aria-hidden="true" />
        <Typography variant="body2">
          Marketplace overview
        </Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <AdminErrorState
            message={error}
            onRetry={refreshDashboard}

          />
        </Box>
      )}

      <Box
        component="section"
        aria-label="Marketplace metrics"
        sx={{
          display: "grid",
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
          gridTemplateColumns: "minmax(0, 1fr)",
          "@media (min-width: 440px)": {
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          },
          "@media (min-width: 1200px)": {
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <MetricCard
          title="Customers"
          value={summary?.totalCustomers ?? null}
          icon={<PeopleIcon aria-hidden="true" />}
          description="Registered customers"
          loading={loading}
          onClick={() => router.push("/admin/customers")}
          actionLabel="View customers"
          accent="primary"
        />

        <MetricCard
          title="Sellers"
          value={summary?.totalSellers ?? null}
          icon={<StoreIcon aria-hidden="true" />}
          description="Registered sellers"
          loading={loading}
          onClick={() => router.push("/admin/sellers")}
          actionLabel="View sellers"
          accent="success"
        />

        <MetricCard
          title="Orders"
          value={summary?.totalOrders ?? null}
          icon={<ShoppingBagIcon aria-hidden="true" />}
          description="Orders in the system"
          loading={loading}
          onClick={() => router.push("/admin/orders")}
          actionLabel="View orders"
          accent="info"
        />

        <MetricCard
          title="Pending KYC"
          value={summary?.pendingKyc ?? null}
          icon={<VerifiedUserIcon aria-hidden="true" />}
          description="Seller verification awaiting review"
          loading={loading}
          onClick={() => router.push("/admin/kyc")}
          actionLabel="Review seller KYC"
          accent="warning"
        />
      </Box>

      {!loading && !error && summary && summary.pendingKyc > 0 && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            borderRadius: 2.5,
            alignItems: { xs: "flex-start", sm: "center" },
            "& .MuiAlert-message": { minWidth: 0 },
          }}
          action={
            <Button
              color="inherit"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push("/admin/kyc")}
              sx={{ minHeight: 40, flexShrink: 0 }}
            >
              Review KYC
            </Button>
          }
        >
          <Typography component="span" sx={{ overflowWrap: "anywhere" }}>
            <strong>{formatMetric(summary.pendingKyc)}</strong>{" "}
            seller KYC record{summary.pendingKyc === 1 ? "" : "s"} awaiting
            review.
          </Typography>
        </Alert>
      )}

      <Box
        component="section"
        aria-labelledby="recent-orders-heading"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="recent-orders-heading"
              variant="h5"
              component="h2"
              sx={{ fontWeight: 800, letterSpacing: "-0.025em" }}
            >
              Recent Orders
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Latest orders returned by the admin order API.
            </Typography>
          </Box>

          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={() => router.push("/admin/orders")}
            sx={{ minHeight: 44, flexShrink: 0 }}
          >
            View all orders
          </Button>
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table
            sx={{ minWidth: 760 }}
            aria-label="Recent marketplace orders"
            aria-busy={loading}
          >
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "action.hover",
                  "& th": {
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    borderBottomColor: "divider",
                  },
                }}
              >
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <AdminTableSkeletonRows columns={6} />
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        Orders could not be loaded
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Use Refresh or Retry to load the latest data.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : showEmptyOrders ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          mx: "auto",
                          mb: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 3,
                          bgcolor: "action.hover",
                        }}
                      >
                        <ShoppingBagIcon color="disabled" aria-hidden="true" />
                      </Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        No recent orders
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        New orders will appear here when available.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => {
                  const orderLabel = order.orderNumber || `#${order.id}`;
                  const status = getStatusPresentation(order.status);

                  return (
                    <TableRow
                      key={order.id}
                      hover
                      tabIndex={0}
                      role="link"
                      aria-label={`Open order ${orderLabel}`}
                      onClick={() => openOrder(order.id)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          openOrder(order.id);
                        }
                      }}
                      sx={{
                        cursor: "pointer",
                        "&:last-child td": { borderBottom: 0 },
                        "&:focus-visible": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: -2,
                        },
                      }}
                    >
                      <TableCell sx={{ minWidth: 125 }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "primary.main",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {orderLabel}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 150 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
                        >
                          {order.shippingFullName || "Ã¢â‚¬â€"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", overflowWrap: "anywhere" }}
                        >
                          {order.shippingCity || "Ã¢â‚¬â€"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={status.label}
                          color={status.color}
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            maxWidth: 180,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 125 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order.paymentMethod || "Ã¢â‚¬â€"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.paymentStatus || "Ã¢â‚¬â€"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatAmount(order.totalAmount, order.currency)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 165, whiteSpace: "nowrap" }}>
                        <Typography variant="body2">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
