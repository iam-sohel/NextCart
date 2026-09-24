"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import { useParams, useRouter } from "next/navigation";

import {
  getAdminOrder,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/services/adminOrderService";

import {
  AdminErrorState,
} from "@/components/admin/AdminStates";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
];

function formatCurrency(
  amount: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "INR"} ${amount.toFixed(2)}`;
  }
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusColor(
  status: string
):
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "info" {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return "success";

    case "CANCELLED":
    case "REFUNDED":
      return "error";

    case "SHIPPED":
      return "info";

    case "PROCESSING":
    case "CONFIRMED":
      return "primary";

    case "PENDING":
      return "warning";

    case "RETURNED":
      return "secondary";

    default:
      return "default";
  }
}

function getPaymentColor(
  status: string
):
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "info" {
  switch (status.toUpperCase()) {
    case "PAID":
      return "success";

    case "FAILED":
    case "CANCELLED":
      return "error";

    case "PENDING":
      return "warning";

    case "REFUNDED":
      return "info";

    default:
      return "default";
  }
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        py: 1,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          textAlign: "right",
          wordBreak: "break-word",
          minWidth: 0,
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = Number(params.id);

  const [order, setOrder] =
    useState<AdminOrder | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] =
    useState(false);

  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await getAdminOrder(orderId);

      setOrder(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadOrder();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadOrder]);

  const handleStatusChange = async (
    event: SelectChangeEvent
  ) => {
    if (!order) return;

    const newStatus = event.target.value;

    if (
      !newStatus ||
      newStatus === order.status
    ) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const updatedOrder =
        await updateAdminOrderStatus(
          order.id,
          newStatus
        );

      setOrder(updatedOrder);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Skeleton
          variant="text"
          width={280}
          height={24}
          sx={{ mb: 2 }}
        />
        <Skeleton
          variant="text"
          width={220}
          height={44}
          sx={{ mb: 2 }}
        />
        <Skeleton
          variant="rounded"
          height={320}
          sx={{ borderRadius: 2, mb: 2 }}
        />
        <Skeleton
          variant="rounded"
          height={200}
          sx={{ borderRadius: 2 }}
        />
      </Box>
    );
  }

  if (error && !order) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 2 }}>
          <AdminErrorState
            message={error}
            onRetry={() => void loadOrder()}
          />
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            router.push("/admin/orders")
          }
          sx={{ minHeight: 44 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Order not found.
        </Alert>
      </Box>
    );
  }

  const shippingAddress = [
    order.shippingStreetAddress,
    order.shippingLandmark,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Breadcrumbs
        sx={{
          mb: 2,
          "& .MuiBreadcrumbs-ol": {
            flexWrap: "wrap",
            rowGap: 0.5,
          },
        }}
      >
        <MuiLink
          component="button"
          underline="hover"
          color="inherit"
          onClick={() =>
            router.push("/admin")
          }
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            border: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <HomeIcon fontSize="small" />
          Admin
        </MuiLink>

        <MuiLink
          component="button"
          underline="hover"
          color="inherit"
          onClick={() =>
            router.push("/admin/orders")
          }
          sx={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Orders
        </MuiLink>

        <Typography color="text.primary" sx={{ overflowWrap: "anywhere" }}>
          {order.orderNumber ||
            `#${order.id}`}
        </Typography>
      </Breadcrumbs>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

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
            variant="h4"
            sx={{
              fontWeight: 700,
              overflowWrap: "anywhere",
              minWidth: 0,
            }}
          >
            Order{" "}
            {order.orderNumber ||
              `#${order.id}`}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Created{" "}
            {formatDate(order.createdAt)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void loadOrder()}
            disabled={loading || updating}
            sx={{ minHeight: 44 }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              router.push("/admin/orders")
            }
            sx={{ minHeight: 44 }}
          >
            Back to Orders
          </Button>
        </Box>
      </Box>

      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  Order Items
                </Typography>

                <Chip
                  label={
                    order.status ||
                    "UNKNOWN"
                  }
                  color={getStatusColor(
                    order.status
                  )}
                />
              </Box>

              <TableContainer sx={{ overflowX: "auto" }}>
                <Table
                  sx={{ minWidth: 640 }}
                  aria-label="Order items"
                >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 700 }}
                    >
                      Product
                    </TableCell>

                    <TableCell
                      sx={{ fontWeight: 700 }}
                    >
                      SKU
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      Qty
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Price
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700 }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {order.items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                      >
                        <Typography
                          color="text.secondary"
                          sx={{
                            py: 3,
                            textAlign: "center",
                          }}
                        >
                          No items found for
                          this order.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    order.items.map(
                      (item) => (
                        <TableRow
                          key={item.id}
                        >
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {item.productName ||
                                "Unknown Product"}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                overflowWrap: "anywhere",
                              }}
                            >
                              Variant ID:{" "}
                              {
                                item.productVariantId
                              }
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ overflowWrap: "anywhere" }}>
                            {item.sku ||
                              "—"}
                          </TableCell>

                          <TableCell align="center">
                            {item.quantity}
                          </TableCell>

                          <TableCell align="right">
                            {formatCurrency(
                              item.unitSellingPrice,
                              order.currency
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {formatCurrency(
                                item.lineTotal,
                                order.currency
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    )
                  )}
                </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Shipping Information
              </Typography>

              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Recipient
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                    }}
                  >
                    {order.shippingFullName ||
                      "—"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Phone
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                    }}
                  >
                    {order.shippingPhoneNumber ||
                      "—"}
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Address
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {shippingAddress ||
                      "—"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Payment Information
              </Typography>

              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Payment Method
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                    }}
                  >
                    {order.paymentMethod ||
                      "—"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Payment Status
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={
                        order.paymentStatus ||
                        "UNKNOWN"
                      }
                      color={getPaymentColor(
                        order.paymentStatus
                      )}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Payment Expires
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      mt: 0.5,
                    }}
                  >
                    {formatDate(
                      order.paymentExpiresAt ||
                        ""
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
        >
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Order Status
              </Typography>

              <FormControl fullWidth>
                <InputLabel id="admin-order-status-label">
                  Status
                </InputLabel>

                <Select
                  labelId="admin-order-status-label"
                  value={order.status}
                  label="Status"
                  disabled={updating}
                  onChange={
                    handleStatusChange
                  }
                  sx={{
                    "&.MuiOutlinedInput-root": {
                      minHeight: 44,
                    },
                  }}
                >
                  {ORDER_STATUSES.map(
                    (status) => (
                      <MenuItem
                        key={status}
                        value={status}
                      >
                        {status}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              {updating && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <CircularProgress
                    size={18}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Updating order status...
                  </Typography>
                </Box>
              )}
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Price Summary
              </Typography>

              <InfoRow
                label="Subtotal"
                value={formatCurrency(
                  order.subtotal,
                  order.currency
                )}
              />

              <InfoRow
                label="Discount"
                value={`- ${formatCurrency(
                  order.discountAmount,
                  order.currency
                )}`}
              />

              <InfoRow
                label="Shipping"
                value={formatCurrency(
                  order.shippingCharge,
                  order.currency
                )}
              />

              <InfoRow
                label="Tax"
                value={formatCurrency(
                  order.taxAmount,
                  order.currency
                )}
              />

              <Divider sx={{ my: 1 }} />

              <InfoRow
                label="Total"
                value={formatCurrency(
                  order.totalAmount,
                  order.currency
                )}
              />
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Order Timeline
              </Typography>

              <InfoRow
                label="Created"
                value={formatDate(
                  order.createdAt
                )}
              />

              <InfoRow
                label="Last Updated"
                value={formatDate(
                  order.updatedAt
                )}
              />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}