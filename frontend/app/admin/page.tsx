"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Stack,
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

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  loading: boolean;
  onClick?: () => void;
}

function MetricCard({
  title,
  value,
  icon,
  description,
  loading,
  onClick,
}: MetricCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        transition: "0.2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: 3,
            }
          : undefined,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {title}
            </Typography>

            {loading ? (
              <CircularProgress
                size={28}
                sx={{ mt: 1.5 }}
              />
            ) : (
              <Typography
                variant="h4"
                sx={{
                  mt: 1,
                  fontWeight: 800,
                }}
              >
                {value.toLocaleString("en-IN")}
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
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
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
      try {
        setLoading(true);
        setError("");

        const [
          dashboardSummary,
          orders,
        ] = await Promise.all([
          getAdminDashboardSummary(),
          getAdminDashboardRecentOrders(),
        ]);

        setSummary(dashboardSummary);
        setRecentOrders(orders);
      } catch (err: any) {
        console.error(
          "Failed to load admin dashboard:",
          err
        );

        setError(
          err?.message ||
            "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
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
        <Box>
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
            Real-time administration overview
            from the connected backend modules.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadDashboard}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Metrics */}
      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <MetricCard
            title="Customers"
            value={
              summary?.totalCustomers ?? 0
            }
            icon={
              <PeopleIcon color="primary" />
            }
            description="Registered customers"
            loading={loading}
            onClick={() =>
              router.push(
                "/admin/customers"
              )
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <MetricCard
            title="Sellers"
            value={
              summary?.totalSellers ?? 0
            }
            icon={
              <StoreIcon color="primary" />
            }
            description="Registered sellers"
            loading={loading}
            onClick={() =>
              router.push(
                "/admin/sellers"
              )
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <MetricCard
            title="Orders"
            value={
              summary?.totalOrders ?? 0
            }
            icon={
              <ShoppingBagIcon color="primary" />
            }
            description="Orders in the system"
            loading={loading}
            onClick={() =>
              router.push(
                "/admin/orders"
              )
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <MetricCard
            title="Pending KYC"
            value={
              summary?.pendingKyc ?? 0
            }
            icon={
              <VerifiedUserIcon color="warning" />
            }
            description="Seller KYC awaiting review"
            loading={loading}
            onClick={() =>
              router.push(
                "/admin/kyc"
              )
            }
          />
        </Grid>
      </Grid>

      {/* Pending KYC alert */}
      {!loading &&
        summary &&
        summary.pendingKyc > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={() =>
                  router.push(
                    "/admin/kyc"
                  )
                }
              >
                Review KYC
              </Button>
            }
          >
            There are{" "}
            <strong>
              {summary.pendingKyc.toLocaleString(
                "en-IN"
              )}
            </strong>{" "}
            seller KYC record
            {summary.pendingKyc === 1
              ? ""
              : "s"} awaiting review.
          </Alert>
        )}

      {/* Recent Orders */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            justifyContent:
              "space-between",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            gap: 1,
          }}
        >
          <Box>
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
              Latest orders returned by the
              admin order API.
            </Typography>
          </Box>

          <Button
            variant="text"
            endIcon={
              <ArrowForwardIcon />
            }
            onClick={() =>
              router.push(
                "/admin/orders"
              )
            }
          >
            View all
          </Button>
        </Box>

        <TableContainer
          sx={{ overflowX: "auto" }}
        >
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Order
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Customer
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Status
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Payment
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ fontWeight: 700 }}
                >
                  Total
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Created
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        py: 6,
                        display: "flex",
                        justifyContent:
                          "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        py: 6,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        No orders found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        The backend returned
                        no orders.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map(
                  (order) => (
                    <TableRow
                      key={order.id}
                      hover
                      sx={{
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        router.push(
                          `/admin/orders/${order.id}`
                        )
                      }
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {order.orderNumber ||
                            `#${order.id}`}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {order.shippingFullName ||
                            "—"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {order.shippingCity ||
                            "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color:
                              getOrderStatusColor(
                                order.status
                              ),
                          }}
                        >
                          {order.status ||
                            "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                        >
                          {order.paymentMethod ||
                            "—"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {order.paymentStatus ||
                            "—"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {order.currency ||
                            "INR"}{" "}
                          {order.totalAmount.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          order.createdAt
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}