"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getOrderById,
  getOrderByNumber,
  type OrderResponseWire,
} from "@/services/orderService";

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();

  const orderIdParam = searchParams.get("orderId");
  const orderNumberParam = searchParams.get("orderNumber");

  const [order, setOrder] = useState<OrderResponseWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError(null);
      setOrder(null);

      if (orderNumberParam) {
        const result = await getOrderByNumber(orderNumberParam);

        if (cancelled) {
          return;
        }

        if (!result.ok) {
          setError(
            result.message || "Unable to verify this order.",
          );
          setLoading(false);
          return;
        }

        setOrder(result.data);
        setLoading(false);
        return;
      }

      if (!orderIdParam) {
        setError("Order number not found.");
        setLoading(false);
        return;
      }

      const orderId = Number(orderIdParam);

      if (!Number.isInteger(orderId) || orderId <= 0) {
        setError("Invalid order.");
        setLoading(false);
        return;
      }

      const result = await getOrderById(orderId);

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setError(
          result.message || "Unable to verify this order.",
        );
        setLoading(false);
        return;
      }

      setOrder(result.data);
      setLoading(false);
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderIdParam, orderNumberParam]);

  if (loading) {
    return (
      <main>
        <h1>Checking your order...</h1>
        <p>Please wait while we verify your order.</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main>
        <h1>Unable to verify order</h1>
        <p>{error || "Order not found."}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Order Placed Successfully</h1>

      <p>Order Number: {order.orderNumber}</p>
    </main>
  );
}