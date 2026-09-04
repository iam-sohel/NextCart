"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import useAuthStore from "@/store/authStore";
import useRequireAuth from "@/hooks/useRequireAuth";
import { getOrders } from "@/services/orderService";
import type { OrderResponseWire } from "@/services/orderService";
import { formatPrice } from "@/utils/formatPrice";

type Order = OrderResponseWire;

function formatDate(value?: string | null): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0";
  }

  return formatPrice(numberValue);
}

function getStatusColor(
  status?: string | null
): "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info" {
  const normalized = String(status || "").toUpperCase();

  if (
    normalized === "DELIVERED" ||
    normalized === "COMPLETED" ||
    normalized === "SUCCESS"
  ) {
    return "success";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "CANCELED" ||
    normalized === "FAILED"
  ) {
    return "error";
  }

  if (
    normalized === "SHIPPED" ||
    normalized === "OUT_FOR_DELIVERY"
  ) {
    return "info";
  }

  if (
    normalized === "PROCESSING" ||
    normalized === "CONFIRMED" ||
    normalized === "PLACED"
  ) {
    return "primary";
  }

  if (normalized === "PENDING") {
    return "warning";
  }

  return "default";
}

function OrderSkeleton() {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Skeleton width="35%" height={30} />
        <Skeleton width="25%" />
        <Skeleton width="100%" height={50} />
        <Skeleton width="80%" />
        <Skeleton width="60%" />
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const { checking, authed } = useRequireAuth("/account/orders");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (checking || !authed) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

    const response = await getOrders();

    if ("data" in response && response.data) {
      setOrders(response.data);
      return;
    }

    setOrders([]);

    if ("message" in response && response.message) {
      setError(response.message);
    } else {
      setError("Unable to load your orders.");
    }
  } catch (err) {
    console.error("Failed to load orders:", err);

    setOrders([]);
    setError("Unable to load your orders. Please try again.");
  } finally {
    setLoading(false);
  }
}, [checking, authed]);

  useEffect(() => {
  if (!checking && authed) {
    loadOrders();
  }
}, [checking, authed, loadOrders]);

  return (
    <>
      <Header />

      <Box
        component="main"
        sx={{
          minHeight: "70vh",
          py: { xs: 3, sm: 4, md: 6 },
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              mb: 4,
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: {
                    xs: "1.7rem",
                    sm: "2rem",
                    md: "2.2rem",
                  },
                }}
              >
                My Orders
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                View your recent orders and order details.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={loadOrders}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={loadOrders}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <>
              <OrderSkeleton />
              <OrderSkeleton />
              <OrderSkeleton />
            </>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  No orders yet
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Your completed orders will appear here.
                </Typography>

                <Button
                  variant="contained"
                  href="/products"
                  sx={{ mt: 3 }}
                >
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={3}>
              {orders.map((order) => {
                const items = order.items || [];
                const visibleItems = items.slice(0, 3);
                const remainingItems = Math.max(items.length - 3, 0);

                return (
                  <Card
                    key={order.id}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        sx={{
                          justifyContent: "space-between",
                          alignItems: { xs: "flex-start", sm: "center" },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700 }}
                          >
                            {"Order #" + (order.orderNumber || order.id)}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {formatDate(order.createdAt)}
                          </Typography>
                        </Box>

                        <Chip
                          label={order.status || "UNKNOWN"}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </Stack>

                      <Divider sx={{ my: 2.5 }} />

                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 7 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 1.5, fontWeight: 700 }}
                          >
                            Items
                          </Typography>

                          <Stack spacing={1.5}>
                            {visibleItems.map((item) => (
                              <Box key={item.id}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {item.productName || "Product"}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {"Qty: " +
                                    (item.quantity ?? 0) +
                                    " • ₹" +
                                    formatMoney(item.lineTotal)}
                                </Typography>
                              </Box>
                            ))}

                            {remainingItems > 0 && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {"+ " + remainingItems + " more"}
                              </Typography>
                            )}

                            {items.length === 0 && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No item information available.
                              </Typography>
                            )}
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 1.5, fontWeight: 700 }}
                          >
                            Order Total
                          </Typography>

                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700 }}
                          >
                            {"₹" + formatMoney(order.totalAmount)}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {order.currency || "INR"}
                          </Typography>
                        </Grid>
                      </Grid>

                      {(order.shippingFullName ||
                        order.shippingStreetAddress ||
                        order.shippingCity ||
                        order.shippingState ||
                        order.shippingPostalCode ||
                        order.shippingCountry ||
                        order.shippingPhoneNumber) && (
                        <>
                          <Divider sx={{ my: 2.5 }} />

                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 1, fontWeight: 700 }}
                          >
                            Shipping Address
                          </Typography>

                          {order.shippingFullName && (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {order.shippingFullName}
                            </Typography>
                          )}

                          {order.shippingPhoneNumber && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {order.shippingPhoneNumber}
                            </Typography>
                          )}

                          {order.shippingStreetAddress && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {order.shippingStreetAddress}
                            </Typography>
                          )}

                          {order.shippingLandmark && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {order.shippingLandmark}
                            </Typography>
                          )}

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {[
                              order.shippingCity,
                              order.shippingState,
                              order.shippingPostalCode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </Typography>

                          {order.shippingCountry && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {order.shippingCountry}
                            </Typography>
                          )}
                        </>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 3,
                        }}
                      >
                        <Button
                          variant="outlined"
                          href={"/account/orders/" + order.id}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Container>
      </Box>

      <Footer />
    </>
  );
}