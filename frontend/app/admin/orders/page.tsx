"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";

import {
  listAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/services/adminOrderService";

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

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<AdminOrder[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] =
    useState(20);

  const [totalElements, setTotalElements] =
    useState(0);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await listAdminOrders(
        page,
        rowsPerPage,
        statusFilter || undefined
      );

      setOrders(result.content);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    statusFilter,
  ]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await loadOrders();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadOrders]);

  const handleStatusFilterChange = (
    event: SelectChangeEvent
  ) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleStatusUpdate = async (
    order: AdminOrder,
    status: string
  ) => {
    if (
      !status ||
      status === order.status
    ) {
      return;
    }

    try {
      setActionLoading(order.id);
      setError("");

      const updatedOrder =
        await updateAdminOrderStatus(
          order.id,
          status
        );

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? updatedOrder
            : currentOrder
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      return (
        order.orderNumber
          .toLowerCase()
          .includes(query) ||
        order.shippingFullName
          .toLowerCase()
          .includes(query) ||
        order.shippingPhoneNumber
          .toLowerCase()
          .includes(query) ||
        order.shippingCity
          .toLowerCase()
          .includes(query)
      );
    });
  }, [orders, search]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
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
            sx={{ fontWeight: 700 }}
          >
            Orders
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage customer orders, payment status,
            and order fulfillment.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void loadOrders()}
          disabled={loading}
          sx={{ minHeight: 44, flexShrink: 0 }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Search orders"
            placeholder="Order number, customer, phone, city..."
            helperText="Searches the currently loaded page only"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            sx={{
              flex: { md: 1 },
              "& .MuiOutlinedInput-root": {
                minHeight: 44,
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                md: 220,
              },
              "& .MuiOutlinedInput-root": {
                minHeight: 44,
              },
            }}
          >
            <InputLabel>
              Order Status
            </InputLabel>

            <Select
              value={statusFilter}
              label="Order Status"
              onChange={
                handleStatusFilterChange
              }
            >
              <MenuItem value="">
                All Statuses
              </MenuItem>

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
        </Box>

        <TableContainer
          sx={{
            overflowX: "auto",
          }}
        >
          <Table
            sx={{
              minWidth: 1000,
            }}
            aria-label="Customer orders"
          >
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
                  Date
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Items
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Payment
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Total
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Status
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ fontWeight: 700 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <>
                  {Array.from({ length: 5 }).map(
                    (_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Array.from({ length: 8 }).map(
                          (_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton
                                variant="text"
                                width="80%"
                              />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    )
                  )}
                </>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box
                      sx={{
                        py: 7,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 600 }}
                      >
                        {orders.length === 0
                          ? "No orders found"
                          : "No matching orders on this page"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {orders.length === 0
                          ? "Try changing your search or status filter."
                          : "Search covers the currently loaded page only. Try a different search or status filter."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const isUpdating =
                    actionLoading === order.id;

                  return (
                    <TableRow
                      key={order.id}
                      hover
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {order.orderNumber ||
                            `#${order.id}`}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          ID: {order.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {order.shippingFullName ||
                            "—"}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          {order.shippingPhoneNumber ||
                            "—"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {order.shippingCity ||
                            "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {formatDate(
                          order.createdAt
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={`${order.items.length} ${
                            order.items.length === 1
                              ? "item"
                              : "items"
                          }`}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {order.paymentMethod ||
                            "—"}
                        </Typography>

                        <Chip
                          size="small"
                          label={
                            order.paymentStatus ||
                            "UNKNOWN"
                          }
                          color={getPaymentColor(
                            order.paymentStatus
                          )}
                          sx={{ mt: 0.5 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{ fontWeight: 700 }}
                        >
                          {formatCurrency(
                            order.totalAmount,
                            order.currency
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {isUpdating ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            role="status"
                          >
                            Updating…
                          </Typography>
                        ) : (
                          <FormControl
                            size="small"
                            sx={{
                              minWidth: 150,
                              "& .MuiOutlinedInput-root": {
                                minHeight: 44,
                              },
                            }}
                          >
                            <Select
                              value={order.status}
                              disabled={isUpdating}
                              inputProps={{
                                "aria-label": `Update status for order ${
                                  order.orderNumber ||
                                  `#${order.id}`
                                }`,
                              }}
                              onChange={(event) =>
                                handleStatusUpdate(
                                  order,
                                  event.target.value
                                )
                              }
                              renderValue={(selected) => (
                                <Chip
                                  size="small"
                                  label={String(selected)}
                                  color={getStatusColor(
                                    String(selected)
                                  )}
                                />
                              )}
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
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          aria-label={`View order ${
                            order.orderNumber ||
                            `#${order.id}`
                          }`}
                          onClick={() =>
                            router.push(
                              `/admin/orders/${order.id}`
                            )
                          }
                          sx={{ minHeight: 44 }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, nextPage) => {
            setPage(nextPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              Number(event.target.value)
            );
            setPage(0);
          }}
          rowsPerPageOptions={[
            10,
            20,
            50,
          ]}
          sx={{
            "& .MuiTablePagination-toolbar": {
              flexWrap: "wrap",
              rowGap: 1,
            },
            "& .MuiTablePagination-actions .MuiIconButton-root": {
              width: 44,
              height: 44,
            },
          }}
        />
      </Paper>
    </Box>
  );
}