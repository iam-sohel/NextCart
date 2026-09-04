"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  cancelOrder,
  getOrderById,
  type OrderResponseWire,
} from "@/services/orderService";

function formatMoney(value?: string | number | null) {
  const amount = Number(value ?? 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function canCancel(status?: string | null) {
  if (!status) {
    return false;
  }

  return [
    "PENDING",
    "CONFIRMED",
    "PLACED",
    "PROCESSING",
  ].includes(status.toUpperCase());
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const { checking, authed } = useRequireAuth(
    "/account/orders"
  );

  const [order, setOrder] = useState<OrderResponseWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

const idParam = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const orderId = Number(idParam);

  useEffect(() => {
    if (checking || !authed) {
      return;
    }

    if (!Number.isInteger(orderId) || orderId <= 0) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const response = await getOrderById(orderId);

        if (cancelled) {
          return;
        }

        if ("data" in response && response.data) {
          setOrder(response.data);
        } else if ("message" in response) {
          setError(
            response.message || "Unable to load order details."
          );
        } else {
          setError("Unable to load order details.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load order details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
}, [checking, authed, orderId]);

  async function handleCancelOrder() {
    if (!order) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setError("");

    try {
      const response = await cancelOrder(order.id);

      if ("data" in response && response.data) {
        setOrder(response.data);
        return;
      }

      if ("message" in response) {
        setError(
          response.message || "Unable to cancel the order."
        );
      } else {
        setError("Unable to cancel the order.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the order."
      );
    } finally {
      setCancelling(false);
    }
  }

  if (checking || loading) {
    return (
      <>
        <Header />

        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  }}
>
  <CircularProgress />
  <Typography color="text.secondary">
    Loading order details...
  </Typography>
</Box>
        </Box>

        <Footer />
      </>
    );
  }

  if (error && !order) {
    return (
      <>
        <Header />

        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            px: 2,
            py: 6,
          }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>

          <Button
            variant="contained"
            onClick={() => router.push("/account/orders")}
          >
            Back to My Orders
          </Button>
        </Box>

        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />

        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            px: 2,
            py: 6,
          }}
        >
          <Alert severity="warning">
            Order details are unavailable.
          </Alert>
        </Box>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Button
              onClick={() => router.push("/account/orders")}
              sx={{ mb: 2 }}
            >
              ← Back to My Orders
            </Button>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.7rem", sm: "2.125rem" },
              }}
            >
              Order Details
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    gap: 2,
                }}
>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    Order #{order.orderNumber}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Placed on {formatDate(order.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    {order.status || "Pending"}
                  </Typography>
                </Box>
              </Box>

              {canCancel(order.status) && (
                <Button
                  variant="outlined"
                  color="error"
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  sx={{ mt: 3 }}
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Order"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700 }}
        >
          Order #{order.orderNumber}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Placed on {formatDate(order.createdAt)}
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            fontWeight: 700,
            textTransform: "capitalize",
          }}
        >
          {order.status || "Pending"}
        </Typography>
      </Box>

      {canCancel(order.status) && (
        <Button
          variant="outlined"
          color="error"
          disabled={cancelling}
          onClick={handleCancelOrder}
          sx={{ mt: 3 }}
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </Button>
      )}
    </Box>
  </CardContent>
</Card>

          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                Items
              </Typography>

              <Stack divider={<Divider />} spacing={0}>
                {order.items?.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      py: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{ fontWeight: 600 }}
                      >
                        {item.productName}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        SKU: {item.sku || "—"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Quantity: {item.quantity}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        MRP: {formatMoney(item.unitMrp)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Selling Price:{" "}
                        {formatMoney(item.unitSellingPrice)}
                      </Typography>

                      {Number(item.discountAmount ?? 0) > 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Discount:{" "}
                          {formatMoney(item.discountAmount)}
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatMoney(item.lineTotal)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                Payment & Summary
              </Typography>

              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Payment Method</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    Cash on Delivery
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Subtotal</Typography>
                  <Typography>
                    {formatMoney(order.subtotal)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Discount</Typography>
                  <Typography>
                    -{formatMoney(order.discountAmount)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Shipping</Typography>
                  <Typography>
                    {formatMoney(order.shippingCharge)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Tax</Typography>
                  <Typography>
                    {formatMoney(order.taxAmount)}
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    Total
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    {formatMoney(order.totalAmount)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Footer />
    </>
  );
}