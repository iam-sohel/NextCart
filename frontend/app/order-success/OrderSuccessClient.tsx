"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OrderSuccessClient() {
  const router = useRouter();
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