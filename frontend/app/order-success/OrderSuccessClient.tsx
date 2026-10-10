"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import {
  getOrderById,
  getOrderByNumber,
  type OrderResponseWire,
} from "@/services/orderService";

type CurrencyValue = number | string | null | undefined;

function numericValue(value: CurrencyValue): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: CurrencyValue, currency = "INR"): string {
  const amount = numericValue(value);
  if (amount === null) return "Not available";

  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "INR";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function readableStatus(value?: string | null): string {
  if (!value) return "Processing";
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusColor(
  status?: string | null,
): "success" | "warning" | "error" | "info" | "default" {
  switch (status?.toUpperCase()) {
    case "DELIVERED":
    case "PAID":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
    case "FAILED":
      return "error";
    case "SHIPPED":
      return "info";
    default:
      return "default";
  }
}

function OrderProgress({ status }: { status?: string | null }) {
  const normalized = status?.toUpperCase() ?? "PENDING";

  if (normalized === "CANCELLED") {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        This order is marked as cancelled. Open your order details for the
        latest information.
      </Alert>
    );
  }

  const stages = [
    {
      label: "Order placed",
      description: "Your order has been recorded.",
      icon: <CheckCircleRoundedIcon />,
      complete: true,
    },
    {
      label: "Processing",
      description: "Your order is moving through processing.",
      icon: <Inventory2OutlinedIcon />,
      complete: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(normalized),
    },
    {
      label: normalized === "DELIVERED" ? "Delivered" : "Shipping",
      description:
        normalized === "DELIVERED"
          ? "The order is marked as delivered."
          : "Shipping updates will appear as the order status changes.",
      icon: <LocalShippingOutlinedIcon />,
      complete: ["SHIPPED", "DELIVERED"].includes(normalized),
    },
  ];

  return (
    <Stack spacing={1.75}>
      {stages.map((stage, index) => (
        <Stack
          key={stage.label}
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "flex-start" }}
        >
          <Stack sx={{ width: 34, flexShrink: 0, alignItems: "center" }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                bgcolor: stage.complete ? "success.light" : "action.hover",
                color: stage.complete ? "success.dark" : "text.secondary",
                "& svg": { fontSize: 19 },
              }}
            >
              {stage.icon}
            </Box>
            {index < stages.length - 1 && (
              <Box
                sx={{
                  width: "2px",
                  height: 20,
                  mt: 0.5,
                  bgcolor: stage.complete ? "success.light" : "divider",
                }}
              />
            )}
          </Stack>
          <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
            <Typography sx={{ fontWeight: 700 }}>{stage.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {stage.description}
            </Typography>
          </Box>
          {stage.complete && (
            <CheckCircleRoundedIcon color="success" sx={{ fontSize: 19, mt: 0.5 }} />
          )}
        </Stack>
      ))}
      <Typography variant="caption" color="text.secondary">
        Status is based on the latest order response. This is not live shipment
        tracking.
      </Typography>
    </Stack>
  );
}

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const orderNumberParam = searchParams.get("orderNumber");
  const cartSyncFailed = searchParams.get("cartSync") === "failed";

  const [order, setOrder] = useState<OrderResponseWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError(null);
      setOrder(null);

      try {
        let result: Awaited<ReturnType<typeof getOrderById>>;

        if (orderNumberParam?.trim()) {
          result = await getOrderByNumber(orderNumberParam);
        } else {
          const orderId = Number(orderIdParam);
          if (!orderIdParam || !Number.isInteger(orderId) || orderId <= 0) {
            if (!cancelled) {
              setError("We could not find a valid order reference in this link.");
              setLoading(false);
            }
            return;
          }
          result = await getOrderById(orderId);
        }

        if (cancelled) return;

        if (!result.ok) {
          setError(result.message || "We could not verify your order right now.");
          setLoading(false);
          return;
        }

        setOrder(result.data);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError("Something went wrong while checking your order. Please try again.");
        setLoading(false);
      }
    }

    void loadOrder();
    return () => {
      cancelled = true;
    };
  }, [orderIdParam, orderNumberParam, retryCount]);

  useEffect(() => {
    if (!copyMessage) return;
    const timeout = window.setTimeout(() => setCopyMessage(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [copyMessage]);

  async function copyOrderNumber() {
    if (!order?.orderNumber) return;

    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopyMessage("Order number copied.");
    } catch {
      setCopyMessage(
        "Clipboard access is unavailable. You can select and copy the order number manually.",
      );
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: "75vh", bgcolor: "background.default", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 5 }, borderRadius: 4 }}>
            <Stack sx={{ alignItems: "center", mb: 4 }}>
              <Skeleton variant="circular" width={76} height={76} />
              <Skeleton width="65%" height={42} />
              <Skeleton width="45%" />
            </Stack>
            <Skeleton height={72} sx={{ borderRadius: 2 }} />
            <Skeleton height={150} sx={{ mt: 2, borderRadius: 2 }} />
            <Skeleton height={120} sx={{ mt: 2, borderRadius: 2 }} />
          </Paper>
        </Container>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: "75vh", bgcolor: "background.default", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="sm">
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, textAlign: "center" }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 2.5,
                borderRadius: "50%",
                bgcolor: "warning.light",
                color: "warning.dark",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ReceiptLongOutlinedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
              We couldn???t verify your order
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {error || "The order could not be found. Please check your order link and try again."}
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "center" }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setRetryCount((count) => count + 1);
                }}
                startIcon={<RefreshRoundedIcon />}
              >
                Try again
              </Button>
              <Button component={Link} href="/account/orders" variant="outlined">
                My orders
              </Button>
            </Stack>
            <Button component={Link} href="/products" sx={{ mt: 1.5 }}>
              Continue shopping
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const formattedDate = formatDate(order.createdAt);
  const currency = order.currency || "INR";
  const addressParts = [
    order.shippingStreetAddress,
    order.shippingLandmark,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry,
  ].filter((part): part is string => Boolean(part?.trim()));
  const shippingAddress = addressParts.join(", ");

  return (
    <Box sx={{ minHeight: "75vh", bgcolor: "background.default", py: { xs: 3, md: 7 } }}>
      <Container maxWidth="md">
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              borderRadius: { xs: 3, md: 4 },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                height: 6,
                background: "linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #86efac 100%)",
              }}
            />
            <Stack
              sx={{
                alignItems: "center",
                textAlign: "center",
                px: { xs: 2.5, sm: 5 },
                py: { xs: 4, md: 5 },
              }}
              spacing={1.5}
            >
              <Box
                sx={{
                  width: 78,
                  height: 78,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  bgcolor: order.status.toUpperCase() === "CANCELLED" ? "error.light" : "success.light",
                  color: order.status.toUpperCase() === "CANCELLED" ? "error.dark" : "success.dark",
                  boxShadow: "0 0 0 9px rgba(22, 163, 74, 0.08)",
                  mb: 1,
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  fontSize: { xs: "1.8rem", sm: "2.35rem" },
                }}
              >
                {order.status.toUpperCase() === "CANCELLED"
                  ? "Order status updated"
                  : "Thank you for your order!"}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 460 }}>
                Your order details are ready. Keep your order number handy to
                check its progress later.
              </Typography>
              <Chip
                color={statusColor(order.status)}
                label={readableStatus(order.status)}
                sx={{ mt: 0.5, fontWeight: 700 }}
              />
            </Stack>

            <Divider />

            <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
                spacing={2}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: "0.12em", fontWeight: 700 }}
                  >
                    Order number
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>
                    {order.orderNumber}
                  </Typography>
                  {formattedDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Placed on {formattedDate}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => void copyOrderNumber()}
                  startIcon={<ContentCopyRoundedIcon />}
                  sx={{ flexShrink: 0 }}
                >
                  Copy number
                </Button>
              </Stack>
              {copyMessage && (
                <Alert
                  severity={copyMessage.startsWith("Order number copied") ? "success" : "info"}
                  sx={{ mt: 2 }}
                >
                  {copyMessage}
                </Alert>
              )}
            </Box>
          </Paper>

          {cartSyncFailed && (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              <Typography sx={{ fontWeight: 700 }}>
                Your order is confirmed, but the cart could not be synchronized.
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Please review your cart before placing another order. This
                warning does not mean that your order failed.
              </Typography>
              <Button component={Link} href="/cart" size="small" sx={{ mt: 1, px: 0 }}>
                Open cart
              </Button>
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
              gap: { xs: 2, md: 3 },
              alignItems: "start",
            }}
          >
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 2.5 }}>
                  <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}>
                    <Inventory2OutlinedIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Order summary
                  </Typography>
                </Stack>

                {order.items.length > 0 ? (
                  <Stack divider={<Divider flexItem />} spacing={2}>
                    {order.items.map((item) => {
                      const unitPrice = item.unitSellingPrice ?? item.unitMrp;
                      const lineTotal =
                        numericValue(item.lineTotal) ??
                        (numericValue(unitPrice) === null
                          ? null
                          : numericValue(unitPrice)! * item.quantity);

                      return (
                        <Stack
                          key={item.id}
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: "flex-start" }}
                        >
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              flexShrink: 0,
                              borderRadius: 2,
                              bgcolor: "action.hover",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <ShoppingBagOutlinedIcon color="action" />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                              {item.productName || "Product"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(unitPrice, currency)} each
                            </Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                            {formatCurrency(lineTotal, currency)}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Item details are not available for this order.
                  </Typography>
                )}

                <Divider sx={{ my: 2.5 }} />
                {[
                  ["Subtotal", order.subtotal],
                  ["Discount", order.discountAmount],
                  ["Shipping", order.shippingCharge],
                  ["Tax", order.taxAmount],
                ].map(([label, value]) =>
                  value === null || value === undefined ? null : (
                    <Stack
                      key={label as string}
                      direction="row"
                      sx={{ justifyContent: "space-between", mb: 1 }}
                      spacing={2}
                    >
                      <Typography color="text.secondary">{label}</Typography>
                      <Typography>{formatCurrency(value, currency)}</Typography>
                    </Stack>
                  ),
                )}
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between", mt: 1.5 }}
                  spacing={2}
                >
                  <Typography color="text.secondary">Order total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {formatCurrency(order.totalAmount, currency)}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Totals are taken from the order service.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 2 }}>
                  <LocalShippingOutlinedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Delivery details
                  </Typography>
                </Stack>
                {order.shippingFullName && (
                  <Typography sx={{ fontWeight: 700 }}>{order.shippingFullName}</Typography>
                )}
                {order.shippingPhoneNumber && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {order.shippingPhoneNumber}
                  </Typography>
                )}
                {shippingAddress ? (
                  <Typography color="text.secondary" sx={{ mt: 0.5, overflowWrap: "anywhere" }}>
                    {shippingAddress}
                  </Typography>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    Delivery address details are not available in this response.
                  </Typography>
                )}
              </Paper>
            </Stack>

            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5 }}>
                  Order progress
                </Typography>
                <OrderProgress status={order.status} />
              </Paper>

              <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Order information
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }} spacing={2}>
                    <Typography color="text.secondary">Status</Typography>
                    <Chip
                      size="small"
                      color={statusColor(order.status)}
                      label={readableStatus(order.status)}
                    />
                  </Stack>
                  {formattedDate && (
                    <Stack direction="row" sx={{ justifyContent: "space-between" }} spacing={2}>
                      <Typography color="text.secondary">Order date</Typography>
                      <Typography sx={{ textAlign: "right" }}>{formattedDate}</Typography>
                    </Stack>
                  )}
                  {order.paymentExpiresAt && (
                    <Typography variant="body2" color="text.secondary">
                      Payment expiry: {formatDate(order.paymentExpiresAt) || order.paymentExpiresAt}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { xs: "stretch", sm: "center" } }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800 }}>You???re all set</Typography>
                <Typography variant="body2" color="text.secondary">
                  You can revisit your order from your account at any time.
                </Typography>
              </Box>
              <Button
                component={Link}
                href={`/account/orders/${order.id}`}
                variant="contained"
                startIcon={<ReceiptLongOutlinedIcon />}
              >
                View order details
              </Button>
              <Button
                component={Link}
                href="/products"
                variant="outlined"
                startIcon={<ShoppingBagOutlinedIcon />}
              >
                Continue shopping
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
