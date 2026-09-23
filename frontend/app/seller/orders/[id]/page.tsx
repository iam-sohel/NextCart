"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import useAuthStore from "@/store/authStore";
import StatusChip, { humanizeStatus } from "@/components/seller/StatusChip";
import {
  SellerErrorState,
  SellerPageSkeleton,
} from "@/components/seller/SellerStates";
import PageHeader from "@/components/ops/PageHeader";
import {
  getSellerOrder,
  type SellerOrder,
} from "@/services/sellerOrderService";
import {
  listSellerEarningsByOrder,
  type SellerEarning,
} from "@/services/sellerEarningService";
import { formatAmount, formatDateTime } from "@/utils/formatAmount";

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
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
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25, wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function SellerOrderDetailPage() {
  const token = useAuthStore((s) => s.token);
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const orderId = Number(rawId);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [earnings, setEarnings] = useState<SellerEarning[]>([]);
  const [earningsWarning, setEarningsWarning] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);
    setEarningsWarning(null);

    const orderResult = await getSellerOrder(orderId, signal);

    if (signal?.aborted) return;

    if (!orderResult.ok) {
      setOrder(null);
      setEarnings([]);
      setLoading(false);
      setLoadError(orderResult.message);
      return;
    }

    const earningsResult = await listSellerEarningsByOrder(
      orderId,
      {
        page: 0,
        size: 20,
        sort: "createdAt,desc",
      },
      signal,
    );

    if (signal?.aborted) return;

    if (!earningsResult.ok) {
      setEarnings([]);
      if (earningsResult.status !== 0) {
        setEarningsWarning(earningsResult.message);
      }
    } else {
      setEarnings(earningsResult.data.content);
    }

    setOrder(orderResult.data);
    setLoading(false);
  }, [orderId]);

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

  if (loading) {
    return <SellerPageSkeleton cards={3} />;
  }

  if (loadError || !order) {
    return (
      <Stack spacing={2}>
        <Button
          component={Link}
          href="/seller/orders"
          variant="text"
          sx={{ alignSelf: "flex-start" }}
        >
          Back to orders
        </Button>
        <SellerErrorState
          message={loadError ?? "Could not load this order."}
          onRetry={() => void load()}
        />
      </Stack>
    );
  }

  const address = [
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
    <div>
      <Button
        component={Link}
        href="/seller/orders"
        variant="text"
        sx={{ mb: 2, px: 0 }}
      >
        Back to orders
      </Button>

      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)} · Payment ${
          order.paymentStatus ? humanizeStatus(order.paymentStatus) : "—"
        }`}
        actions={<StatusChip status={order.status} />}
      />

      <Stack spacing={3}>
        <Alert severity="info">
          Only order items belonging to your seller account are shown. Order
          totals are the complete customer order, not your earnings. Seller
          order-status changes are not available in the current backend.
        </Alert>

        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Your items
            </Typography>

            {order.items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                This order contains no items belonging to your account.
              </Typography>
            ) : (
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table aria-label="Seller order items" sx={{ minWidth: 680 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit price</TableCell>
                      <TableCell align="right">Line total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={item.id ?? `item-${index}` }>
                        <TableCell>{item.productName || "Product"}</TableCell>
                        <TableCell>{item.sku || "—"}</TableCell>
                        <TableCell align="right">
                          {item.quantity ?? "—"}
                        </TableCell>
                        <TableCell align="right">
                          {formatAmount(item.unitSellingPrice)}
                        </TableCell>
                        <TableCell align="right">
                          {formatAmount(item.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
              Fulfilment and payment
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Customer" value={order.shippingFullName || "—"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField label="Phone" value={order.shippingPhoneNumber || "—"} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InfoField label="Delivery address" value={address || "—"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField
                  label="Payment method"
                  value={order.paymentMethod || "—"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField
                  label="Payment status"
                  value={
                    order.paymentStatus ? (
                      <StatusChip status={order.paymentStatus} />
                    ) : (
                      "—"
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField
                  label="Complete order total"
                  value={`${formatAmount(order.totalAmount)}${order.currency ? ` ${order.currency}` : ""}`}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoField
                  label="Updated"
                  value={formatDateTime(order.updatedAt)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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
                Linked earnings
              </Typography>
              <Button
                component={Link}
                href="/seller/earnings"
                size="small"
                variant="outlined"
                sx={{ minHeight: 44 }}
              >
                Open earnings
              </Button>
            </Stack>

            {earningsWarning ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Earnings linked to this order are unavailable: {earningsWarning}
              </Alert>
            ) : null}

            {earnings.length === 0 && !earningsWarning ? (
              <Typography variant="body2" color="text.secondary">
                No earning records are currently linked to this order.
              </Typography>
            ) : null}

            {earnings.length > 0 ? (
              <Stack spacing={1.5}>
                {earnings.map((earning) => (
                  <Box
                    key={earning.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {earning.productName || "Product"}
                        {earning.sku ? ` · ${earning.sku}` : ""}
                      </Typography>
                      <StatusChip status={earning.status} />
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Net {formatAmount(earning.netAmount)} · Gross{" "}
                      {formatAmount(earning.grossAmount)} · Commission{" "}
                      {formatAmount(earning.commissionAmount)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : null}
          </CardContent>
        </Card>
      </Stack>
    </div>
  );
}
