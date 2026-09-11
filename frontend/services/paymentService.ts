interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const payload = (await response.json().catch(() => null)) as
      | { data?: T; message?: string }
      | T
      | null;

    return {
      ok: response.ok,
      data:
        payload && typeof payload === "object" && "data" in payload
          ? (payload.data as T)
          : (payload as T),
      message:
        payload && typeof payload === "object" && "message" in payload
          ? payload.message
          : undefined,
    };
  } catch {
    return {
      ok: false,
      data: {} as T,
      message: "Unable to connect to the server.",
    };
  }
}

export interface CreatePaymentRequest {
  orderId: number;
}

export interface CreatePaymentResponse {
  orderId: number;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentResponse {
  transactionId: number;
  orderId: number;
  orderNumber: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  amount: number;
  refundedAmount?: number | null;
  currency: string;
  status: string;
  createdAt?: string | null;
}

const PAYMENT_ENDPOINTS = {
  create: "/api/v1/payments/create",
  verify: "/api/v1/payments/verify",
  status: (orderId: number) => `/api/v1/payments/order/${orderId}`,
  reconcile: (orderId: number) =>
    `/api/v1/payments/reconcile?orderId=${encodeURIComponent(orderId)}`,
  refund: (orderId: number) => `/api/v1/payments/order/${orderId}/refund`,
};

function toNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  return Number.isFinite(parsed) ? parsed : fallback;
}

function normaliseCreatePayment(
  data: CreatePaymentResponse
): CreatePaymentResponse {
  return {
    orderId: Number(data.orderId),
    orderNumber: data.orderNumber,
    razorpayOrderId: data.razorpayOrderId,
    amount: Number(data.amount),
    currency: data.currency,
    keyId: data.keyId,
  };
}

function normalisePayment(data: PaymentResponse): PaymentResponse {
  return {
    transactionId: Number(data.transactionId),
    orderId: Number(data.orderId),
    orderNumber: data.orderNumber,
    razorpayOrderId: data.razorpayOrderId ?? null,
    razorpayPaymentId: data.razorpayPaymentId ?? null,
    amount: toNumber(data.amount),
    refundedAmount:
      data.refundedAmount == null
        ? null
        : toNumber(data.refundedAmount),
    currency: data.currency,
    status: data.status,
    createdAt: data.createdAt ?? null,
  };
}

/**
 * Creates the Razorpay order for an already-created NextCart order.
 *
 * IMPORTANT:
 * Backend returns `amount` in paise.
 * Do NOT multiply this value by 100 again.
 */
export async function createPayment(
  request: CreatePaymentRequest
): Promise<{
  ok: boolean;
  data: CreatePaymentResponse;
  message?: string;
}> {
  const response = await apiRequest<CreatePaymentResponse>(
    PAYMENT_ENDPOINTS.create,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    return {
      ok: false,
      data: {} as CreatePaymentResponse,
      message: response.message || "Unable to create payment.",
    };
  }

  return {
    ok: true,
    data: normaliseCreatePayment(response.data),
  };
}

/**
 * Verifies the Razorpay payment on the backend.
 */
export async function verifyPayment(
  request: VerifyPaymentRequest
): Promise<{
  ok: boolean;
  data: PaymentResponse;
  message?: string;
}> {
  const response = await apiRequest<PaymentResponse>(
    PAYMENT_ENDPOINTS.verify,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    return {
      ok: false,
      data: {} as PaymentResponse,
      message: response.message || "Payment verification failed.",
    };
  }

  return {
    ok: true,
    data: normalisePayment(response.data),
  };
}

/**
 * Returns the current payment status for an order.
 */
export async function getPaymentStatus(
  orderId: number
): Promise<{
  ok: boolean;
  data: PaymentResponse;
  message?: string;
}> {
  const response = await apiRequest<PaymentResponse>(
    PAYMENT_ENDPOINTS.status(orderId),
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    return {
      ok: false,
      data: {} as PaymentResponse,
      message: response.message || "Unable to get payment status.",
    };
  }

  return {
    ok: true,
    data: normalisePayment(response.data),
  };
}

/**
 * Reconciles the payment status with Razorpay.
 */
export async function reconcilePayment(
  orderId: number
): Promise<{
  ok: boolean;
  data: PaymentResponse;
  message?: string;
}> {
  const response = await apiRequest<PaymentResponse>(
    PAYMENT_ENDPOINTS.reconcile(orderId),
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    return {
      ok: false,
      data: {} as PaymentResponse,
      message: response.message || "Unable to reconcile payment.",
    };
  }

  return {
    ok: true,
    data: normalisePayment(response.data),
  };
}

/**
 * Requests a refund for a successfully-paid order.
 */
export async function refundPayment(
  orderId: number
): Promise<{
  ok: boolean;
  data: PaymentResponse;
  message?: string;
}> {
  const response = await apiRequest<PaymentResponse>(
    PAYMENT_ENDPOINTS.refund(orderId),
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    return {
      ok: false,
      data: {} as PaymentResponse,
      message: response.message || "Unable to process refund.",
    };
  }

  return {
    ok: true,
    data: normalisePayment(response.data),
  };
}