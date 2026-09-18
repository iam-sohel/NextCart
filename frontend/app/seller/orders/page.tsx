"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
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
  SELLER_ORDER_STATUSES,
  listSellerOrders,
  listSellerOrdersByStatus,
  type SellerOrderPage,
  type SellerOrderSort,
  type SellerOrderStatus,
} from "@/services/sellerOrderService";
import { formatAmount, formatDateTime } from "@/utils/formatAmount";

type StatusFilter = "ALL" | SellerOrderStatus;

const PAGE_SIZES = [10, 20, 50];

const SORTS: Array<{ value: SellerOrderSort; label: string }> = [
  { value: "createdAt,desc", label: "Newest first" },
  { value: "createdAt,asc", label: "Oldest first" },
];

export default function SellerOrdersPage() {
  const token = useAuthStore((s) => s.token);

  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState<SellerOrderSort>("createdAt,desc");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ordersPage, setOrdersPage] = useState<SellerOrderPage | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);

    const result =
      status === "ALL"
        ? await listSellerOrders({ page, size, sort }, signal)
        : await listSellerOrdersByStatus(status, { page, size, sort }, signal);

    if (signal?.aborted) return;

    if (!result.ok) {
      setOrdersPage(null);
      setLoading(false);
      setLoadError(result.message);
      return;
    }

    setOrdersPage(result.data);
    setLoading(false);
  }, [status, page, size, sort]);

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

  const resetPage = (next: Partial<{ status: StatusFilter; size: number; sort: SellerOrderSort }>) => {
    if (next.status !== undefined) setStatus(next.status);
    if (next.size !== undefined) setSize(next.size);
    if (next.sort !== undefined) setSort(next.sort);
    setPage(0);
  };

  if (loading) {
    return <SellerPageSkeleton cards={3} />;
  }

  if (loadError || !ordersPage) {
    return (
      <SellerErrorState
        message={loadError ?? "Could not load your orders."}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <div>
      <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Orders
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Orders that contain at least one of your products. Order totals are the
        complete customer order; only the listed items belong to you.
      </Typography>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Order status"
                value={status}
                onChange={(event) =>
                  resetPage({ status: event.target.value as StatusFilter })
                }
              >
                <MenuItem value="ALL">All statuses</MenuItem>
                {SELLER_ORDER_STATUSES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {humanizeStatus(value)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Sort"
                value={sort}
                onChange={(event) =>
                  resetPage({ sort: event.target.value as SellerOrderSort })
                }
              >
                {SORTS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Orders per page"
                value={String(size)}
                onChange={(event) =>
                  resetPage({ size: Number(event.target.value) })
                }
              >
                {PAGE_SIZES.map((value) => (
                  <MenuItem key={value} value={String(value)}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {ordersPage.content.length === 0 ? (
        <SellerEmptyState
          title="No orders found"
          description={
            status === "ALL"
              ? "No customer orders currently contain your products."
              : `No orders with the status “${humanizeStatus(status)}” were found.`
          }
          action={
            <Button component={Link} href="/seller/products/new" variant="outlined">
              Add a product
            </Button>
          }
        />
      ) : (
        <Stack spacing={2}>
          {ordersPage.content.map((order) => {
            const itemSummary =
              order.items.length === 0
                ? "No seller items in this record."
                : order.items
                    .slice(0, 2)
                    .map(
                      (item) =>
                        `${item.productName || "Product"}${item.sku ? ` · ${item.sku}` : ""} × ${item.quantity ?? "—"}`,
                    )
                    .join("; ") +
                  (order.items.length > 2
                    ? `; +${order.items.length - 2} more`
                    : "");

            return (
              <Card key={order.id} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Order {order.orderNumber}
                    </Typography>
                    <StatusChip status={order.status} />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Placed {formatDateTime(order.createdAt)} · {order.items.length}{" "}
                    seller item{order.items.length === 1 ? "" : "s"}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    {itemSummary}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ alignItems: { xs: "stretch", sm: "center" } }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {formatAmount(order.totalAmount)}
                      {order.currency ? ` ${order.currency}` : ""}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flexGrow: 1 }}
                    >
                      Complete order total
                    </Typography>
                    <Button
                      component={Link}
                      href={`/seller/orders/${order.id}`}
                      variant="outlined"
                      size="small"
                    >
                      View details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Button
              variant="outlined"
              disabled={page <= 0 || ordersPage.first}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
              role="status"
              sx={{ flexGrow: 1, textAlign: "center" }}
            >
              Page {ordersPage.number + 1} of{" "}
              {Math.max(ordersPage.totalPages, 1)} ·{" "}
              {ordersPage.totalElements} order
              {ordersPage.totalElements === 1 ? "" : "s"}
            </Typography>
            <Button
              variant="outlined"
              disabled={ordersPage.last}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      )}
    </div>
  );
}
