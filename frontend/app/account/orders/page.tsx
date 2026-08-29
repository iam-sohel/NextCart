"use client";

import { useEffect, useState } from "react";

import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Alert,
  Chip,
  Skeleton,
  Divider,
  Stack,
} from "@mui/material";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import useAuthStore from "@/store/authStore";
import useRequireAuth from "@/hooks/useRequireAuth";
import { getOrders } from "@/services/orderService";
import type { OrderResponseWire } from "@/services/orderService";
import { formatPrice } from "@/utils/formatPrice";

type Order = OrderResponseWire;

export default function AccountOrdersPage() {
  const token = useAuthStore((s) => s.token);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useRequireAuth("/account/orders");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const res = await getOrders();
        if (!cancelled) {
          if (res.ok) {
            setOrders(res.data || []);
          } else {
            setError(res.message || "Failed to load orders");
          }
        }
      } catch {
        if (!cancelled) {
          setError("An unexpected error occurred");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return "success";
      case "SHIPPED":
        return "info";
      case "CONFIRMED":
        return "primary";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <Header />

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Orders
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
            <Button onClick={() => {}} size="small" sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {loading && orders.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Loading orders…
            </Typography>
            <Grid container spacing={2}>
              {[1, 2, 3].map((i) => (
                <Grid size={{ xs: 12 }} key={i}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Skeleton variant="rectangular" height={120} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : orders.length === 0 ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No orders yet
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Your order history will appear here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card key={order.id} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Order #{order.orderNumber}
                        </Typography>
                        <Chip
                          label={order.status || "—"}
                          size="small"
                          color={getStatusColor(order.status)}
                          variant="outlined"
                        />
                      </Box>
                      <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                        Placed on {formatDate(order.createdAt)}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                        {order.paymentMethod ? `Payment: ${order.paymentMethod}` : ""}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right", minWidth: 150 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        ₹{formatPrice(order.totalAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.paymentStatus && `Payment: ${order.paymentStatus}`}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {order.items.slice(0, 3).map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.5,
                          py: 0.75,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                        }}
                      >
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            style={{ width: 40, height: 40, objectFit: "contain" }}
                          />
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qty: {item.quantity} • ₹{formatPrice(item.itemTotal)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    {order.items.length > 3 && (
                      <Chip
                        label={`+${order.items.length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {order.shippingFullName && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Shipping to: {order.shippingFullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.shippingStreetAddress}
                        {order.shippingCity ? `, ${order.shippingCity}` : ""}
                        {order.shippingPostalCode ? ` - ${order.shippingPostalCode}` : ""}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      <Footer />
    </>
  );
}