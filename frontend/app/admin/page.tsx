"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
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

import { useRouter } from "next/navigation";

import {
  getAdminDashboardRecentOrders,
  getAdminDashboardSummary,
  type AdminDashboardSummary,
} from "@/services/adminDashboardService";

import type { AdminOrder } from "@/services/adminOrderService";

import {
  AdminErrorState,
} from "@/components/admin/AdminStates";

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  loading: boolean;
  onClick?: () => void;
  actionLabel: string;
}

/** Backend totals are rendered verbatim; only non-finite values fall back. */
function formatMetric(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
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
}: MetricCardProps) {
  const body = (
    <CardContent sx={{ p: 2.5, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
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
              width={96}
              height={44}
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 800,
                overflowWrap: "anywhere",
              }}
            >
              {formatMetric(value)}
            </Typography>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {description}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {onClick ? (
        <CardActionArea
          onClick={onClick}
          aria-label={actionLabel}
          sx={{ height: "100%" }}
        >
          {body}
        </CardActionArea>
      ) : (
        body
      )}
    </Card>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getOrderStatusColor(status: string) {
  const normalized = status.toUpperCase();

  if (
    normalized === "DELIVERED" ||
    normalized === "COMPLETED"
  ) {
    return "success.main";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "FAILED"
  ) {
    return "error.main";
  }

  if (
    normalized === "PENDING" ||
    normalized === "PROCESSING"
  ) {
    return "warning.main";
  }

  return "text.primary";
}

function OrderTableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: 6 }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [summary, setSummary] =
    useState<AdminDashboardSummary | null>(null);

  const [recentOrders, setRecentOrders] =
    useState<AdminOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          dashboardSummary,
          orders,
        ] = await Promise.all([
          getAdminDashboardSummary(),
          getAdminDashboardRecentOrders(),
        ]);

        setSummary(dashboardSummary);
        setRecentOrders(orders);
      } catch (err) {
        // Any rejection means "could not load" — the services never
        // resolve failure as empty data, so this is a real error state.
        setSummary(null);
        setRecentOrders([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadDashboard();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadDashboard]);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            Admin Console
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Operational overview of the NextCart marketplace.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void loadDashboard()}
          disabled={loading}
          sx={{ minHeight: 44, flexShrink: 0 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Error — a failed request is never shown as zero data */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <AdminErrorState
            message={error}
            onRetry={() => void loadDashboard()}
          />
        </Box>
      )}

      {/* Metrics: 1 column on phones, 2 columns from 440px, 4 on desktop */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 3,
          gridTemplateColumns: "1fr",
          "@media (min-width:440px)": {
            gridTemplateColumns: "repeat(2, 1fr)",
          },
          "@media (min-width:1200px)": {
            gridTemplateColumns: "repeat(4, 1fr)",
          },
        }}
      >
        <MetricCard
          title="Customers"
          value={summary?.totalCustomers ?? 0}
          icon={<PeopleIcon color="primary" />}
          description="Registered customers"
          loading={loading}
          onClick={() => router.push("/admin/customers")}
          actionLabel="View customers"
        />

        <MetricCard
          title="Sellers"
          value={summary?.totalSellers ?? 0}
          icon={<StoreIcon color="primary" />}
          description="Registered sellers"
          loading={loading}
          onClick={() => router.push("/admin/sellers")}
          actionLabel="View sellers"
        />

        <MetricCard
          title="Orders"
          value={summary?.totalOrders ?? 0}
          icon={<ShoppingBagIcon color="primary" />}
          description="Orders in the system"
          loading={loading}
          onClick={() => router.push("/admin/orders")}
          actionLabel="View orders"
        />

        <MetricCard
          title="Pending KYC"
          value={summary?.pendingKyc ?? 0}
          icon={<VerifiedUserIcon color="warning" />}
          description="Seller KYC awaiting review"
          loading={loading}
          onClick={() => router.push("/admin/kyc")}
          actionLabel="Review seller KYC"
        />
      </Box>

      {/* Pending KYC attention — only when the backend reports pending items */}
      {!loading &&
        !error &&
        summary &&
        summary.pendingKyc > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 3, alignItems: "center" }}
            action={
              <Button
                color="inherit"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/admin/kyc")}
                sx={{ minHeight: 44, flexShrink: 0 }}
              >
                Review KYC
              </Button>
            }
          >
            <Box sx={{ overflowWrap: "anywhere" }}>
              There are{" "}
              <strong>
                {formatMetric(summary.pendingKyc)}
              </strong>{" "}
              seller KYC record
              {summary.pendingKyc === 1 ? "" : "s"} awaiting review.
            </Box>
          </Alert>
        )}

      {/* Recent Orders */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700 }}
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
            View all
          </Button>
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 700 }} aria-label="Recent orders">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  Order
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Customer
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Payment
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Created
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <OrderTableSkeletonRows />
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        No recent orders
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        The backend returned no recent orders.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => {
                  const orderLabel =
                    order.orderNumber || `#${order.id}`;

                  const openOrder = () =>
                    router.push(`/admin/orders/${order.id}`);

                  return (
                    <TableRow
                      key={order.id}
                      hover
                      tabIndex={0}
                      role="link"
                      aria-label={`Open order ${orderLabel}`}
                      onClick={openOrder}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          openOrder();
                        }
                      }}
                      sx={{
                        cursor: "pointer",
                        "&:focus-visible": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: -2,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {orderLabel}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {order.shippingFullName || "—"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {order.shippingCity || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: getOrderStatusColor(order.status),
                          }}
                        >
                          {order.status || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {order.paymentMethod || "—"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {order.paymentStatus || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.currency || "INR"}{" "}
                          {order.totalAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {formatDate(order.createdAt)}
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
