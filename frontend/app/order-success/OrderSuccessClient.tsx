"use client";

import { useSearchParams } from "next/navigation";

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("orderId");

  return (
    <main>
      <h1>Order Placed Successfully</h1>

      {orderNumber ? (
        <p>Order Number: {orderNumber}</p>
      ) : (
        <p>Order number not found.</p>
      )}
    </main>
  );
}