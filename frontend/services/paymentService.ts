/**
 * NEXTCART — Payment service boundary.
 *
 * All payment API communication goes through the centralized authenticated
 * client in `lib/api.ts`:
 *
 *   - Bearer access token attached automatically on every call,
 *   - transparent 401/403/500 → refresh → retry handling,
 *   - `NEXT_PUBLIC_API_BASE_URL`-aware absolute URLs,
 *   - backend error envelopes surfaced as-is (never swallowed).
 *
 * Never call `fetch()` directly from here and never read tokens manually —
 * the auth bootstrap (`lib/authInterceptor.ts`) already wires the token
 * getter, the single-flight refresher and the terminal auth-failure handler
 * into `apiRequest`.
 */

import {
  apiRequest,
  type ApiResult,
  type ApiFailure,
} from "@/lib/api";

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

/**
 * Spring `ApiResponse<T>` envelope: `{ success, message, data }`.
 */
interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

const PAYMENT_ENDPOINTS = {
  create: "/api/v1/payments/create",
  verify: "/api/v1/payments/verify",
  status: (orderId: number) => `/api/v1/payments/order/${orderId}`,
  reconcile: (orderId: number) =>
    `/api/v1/payments/reconcile?orderId=${encodeURIComponent(orderId)}`,
  refund: (orderId: number) => `/api/v1/payments/order/${orderId}/refund`,
} as const;

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
 * Unwraps the Spring `ApiResponse` envelope and normalises a payment DTO.
 *
 * Returns `null` when the payload does not carry the expected `data` object.
 * A typed narrow failure (instead of `unknown` casting) keeps the invalid
 * payload distinct from a transport failure while staying strict-safe.
 */
function unwrapEnvelope<T>(
  payload: BackendEnvelope<T> | T | null,
  normalise: (data: T) => T
): T | null {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return null;
  }

  const data = (payload as BackendEnvelope<T>).data;

  if (data === null || data === undefined) {
    return null;
  }

  return normalise(data);
}

/**
 * Builds a failure result from an `apiRequest` failure. The backend message
 * (and error code, when present) is preserved verbatim — auth errors are
 * never swallowed here.
 */
function failureFrom(
  res: ApiFailure,
  fallbackMessage: string
): ApiResult<never> {
  return {
    ok: false,
    status: res.status,
    message: res.message || fallbackMessage,
    ...(res.errorCode !== undefined ? { errorCode: res.errorCode } : {}),
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
): Promise<ApiResult<CreatePaymentResponse>> {
  const res = await apiRequest<BackendEnvelope<CreatePaymentResponse>>(
    PAYMENT_ENDPOINTS.create,
    {
      method: "POST",
      body: request,
    }
  );

  if (!res.ok) {
    return failureFrom(res, "Unable to create payment.");
  }

  const data = unwrapEnvelope(res.data, normaliseCreatePayment);

  if (!data) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid payment response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data,
  };
}

/**
 * Verifies the Razorpay payment on the backend.
 */
export async function verifyPayment(
  request: VerifyPaymentRequest
): Promise<ApiResult<PaymentResponse>> {
  const res = await apiRequest<BackendEnvelope<PaymentResponse>>(
    PAYMENT_ENDPOINTS.verify,
    {
      method: "POST",
      body: request,
    }
  );

  if (!res.ok) {
    return failureFrom(res, "Payment verification failed.");
  }

  const data = unwrapEnvelope(res.data, normalisePayment);

  if (!data) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid payment response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data,
  };
}

/**
 * Returns the current payment status for an order.
 */
export async function getPaymentStatus(
  orderId: number
): Promise<ApiResult<PaymentResponse>> {
  const res = await apiRequest<BackendEnvelope<PaymentResponse>>(
    PAYMENT_ENDPOINTS.status(orderId),
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    return failureFrom(res, "Unable to get payment status.");
  }

  const data = unwrapEnvelope(res.data, normalisePayment);

  if (!data) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid payment response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data,
  };
}

/**
 * Reconciles the payment status with Razorpay.
 */
export async function reconcilePayment(
  orderId: number
): Promise<ApiResult<PaymentResponse>> {
  const res = await apiRequest<BackendEnvelope<PaymentResponse>>(
    PAYMENT_ENDPOINTS.reconcile(orderId),
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    return failureFrom(res, "Unable to reconcile payment.");
  }

  const data = unwrapEnvelope(res.data, normalisePayment);

  if (!data) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid payment response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data,
  };
}

/**
 * Requests a refund for a successfully-paid order.
 */
export async function refundPayment(
  orderId: number
): Promise<ApiResult<PaymentResponse>> {
  const res = await apiRequest<BackendEnvelope<PaymentResponse>>(
    PAYMENT_ENDPOINTS.refund(orderId),
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    return failureFrom(res, "Unable to process refund.");
  }

  const data = unwrapEnvelope(res.data, normalisePayment);

  if (!data) {
    return {
      ok: false,
      status: res.status,
      message: "The server returned an invalid payment response.",
    };
  }

  return {
    ok: true,
    status: res.status,
    data,
  };
}
