package com.nextcart.nextcart.payment_module.service;

import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.order_module.OrderRepository;
import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.payment_module.PaymentGatewayException;
import com.nextcart.nextcart.payment_module.PaymentNotFoundException;
import com.nextcart.nextcart.payment_module.PaymentValidationException;
import com.nextcart.nextcart.payment_module.PaymentVerificationException;
import com.nextcart.nextcart.payment_module.dto.CreatePaymentRequestDTO;
import com.nextcart.nextcart.payment_module.dto.CreatePaymentResponseDTO;
import com.nextcart.nextcart.payment_module.dto.PaymentResponseDTO;
import com.nextcart.nextcart.payment_module.dto.VerifyPaymentRequestDTO;
import com.nextcart.nextcart.payment_module.entity.PaymentStatusEnum;
import com.nextcart.nextcart.payment_module.entity.PaymentTransaction;
import com.nextcart.nextcart.payment_module.repository.PaymentTransactionRepository;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Refund;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final BigDecimal HUNDRED =
            BigDecimal.valueOf(100);

    private final PaymentTransactionRepository paymentRepository;

    private final OrderRepository orderRepository;

    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;


    // =========================================================
    // CREATE RAZORPAY ORDER
    // =========================================================

    @Override
    @Transactional
    public CreatePaymentResponseDTO createRazorpayOrder(
            String userEmail,
            CreatePaymentRequestDTO requestDto) {

        validateEmail(userEmail);
        validateCreateRequest(requestDto);

        User user = getUser(userEmail);

        OrderEntity order =
                orderRepository
                        .findByIdForUpdate(
                                requestDto.getOrderId()
                        )
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Order not found"
                                )
                        );

        validateOrderOwnership(
                order,
                user
        );

        if (order.getStatus() !=
                OrderStatus.PENDING) {

            throw new PaymentValidationException(
                    "Payment can only be created for a PENDING order"
            );
        }

        validatePaymentWindow(order);

        if (order.getTotalAmount() == null ||
                order.getTotalAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new PaymentValidationException(
                    "Order total amount must be greater than zero"
            );
        }

        if (order.getCurrency() == null ||
                order.getCurrency().isBlank()) {

            throw new PaymentValidationException(
                    "Order currency is required"
            );
        }

        /*
         * Only one payment transaction is allowed
         * for one order.
         */
        if (paymentRepository
                .findByOrder(order)
                .isPresent()) {

            throw new PaymentValidationException(
                    "Payment transaction already exists for this order"
            );
        }

        long amountInPaise =
                convertToPaise(
                        order.getTotalAmount()
                );

        try {

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            keyId,
                            keySecret
                    );

            JSONObject request =
                    new JSONObject();

            request.put(
                    "amount",
                    amountInPaise
            );

            request.put(
                    "currency",
                    order.getCurrency()
            );

            request.put(
                    "receipt",
                    order.getOrderNumber()
            );

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.create(
                            request
                    );

            String razorpayOrderId =
                    razorpayOrder.get("id");

            if (razorpayOrderId == null ||
                    razorpayOrderId.isBlank()) {

                throw new PaymentGatewayException(
                        "Razorpay did not return an order ID",
                        null
                );
            }

            PaymentTransaction transaction =
                    PaymentTransaction.builder()
                            .user(user)
                            .order(order)
                            .razorpayOrderId(
                                    razorpayOrderId
                            )
                            .amountInPaise(
                                    amountInPaise
                            )
                            .amountInRupees(
                                    order.getTotalAmount()
                            )
                            .currency(
                                    order.getCurrency()
                            )
                            .status(
                                    PaymentStatusEnum.CREATED
                            )
                            .build();

            paymentRepository.save(
                    transaction
            );

            return CreatePaymentResponseDTO
                    .builder()
                    .orderId(order.getId())
                    .orderNumber(
                            order.getOrderNumber()
                    )
                    .razorpayOrderId(
                            razorpayOrderId
                    )
                    .amount(
                            amountInPaise
                    )
                    .currency(
                            order.getCurrency()
                    )
                    .keyId(keyId)
                    .build();

        } catch (PaymentGatewayException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new PaymentGatewayException(
                    "Razorpay order creation failed",
                    exception
            );
        }
    }


    // =========================================================
    // VERIFY PAYMENT
    // =========================================================

    @Override
    @Transactional
    public PaymentResponseDTO verifyPayment(
            String userEmail,
            VerifyPaymentRequestDTO requestDto) {

        validateEmail(userEmail);
        validateVerifyRequest(requestDto);

        User user = getUser(userEmail);

        /*
         * ORDER LOCK FIRST
         */
        OrderEntity order =
                orderRepository
                        .findByIdForUpdate(
                                requestDto.getOrderId()
                        )
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Order not found"
                                )
                        );

        validateOrderOwnership(
                order,
                user
        );

        /*
         * PAYMENT LOCK SECOND
         */
        PaymentTransaction transaction =
                paymentRepository
                        .findByRazorpayOrderIdForUpdate(
                                requestDto
                                        .getRazorpayOrderId()
                        )
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Payment transaction not found"
                                )
                        );

        validatePaymentBelongsToOrder(
                transaction,
                order
        );

        /*
         * Idempotency.
         */
        if (transaction.getStatus() ==
                PaymentStatusEnum.SUCCESS) {

            return mapToResponseDTO(
                    transaction
            );
        }

        if (transaction.getStatus() ==
                PaymentStatusEnum.REFUNDED) {

            throw new PaymentVerificationException(
                    "Payment has already been refunded"
            );
        }

        if (transaction.getStatus() ==
                PaymentStatusEnum.EXPIRED) {

            throw new PaymentVerificationException(
                    "Payment has expired"
            );
        }

        if (order.getStatus() !=
                OrderStatus.PENDING) {

            throw new PaymentVerificationException(
                    "Order is no longer in PENDING status"
            );
        }

        validatePaymentWindow(order);

        try {

            /*
             * Verify frontend signature.
             */
            JSONObject attributes =
                    new JSONObject();

            attributes.put(
                    "razorpay_order_id",
                    requestDto.getRazorpayOrderId()
            );

            attributes.put(
                    "razorpay_payment_id",
                    requestDto.getRazorpayPaymentId()
            );

            attributes.put(
                    "razorpay_signature",
                    requestDto.getRazorpaySignature()
            );

            boolean validSignature =
                    Utils.verifyPaymentSignature(
                            attributes,
                            keySecret
                    );

            if (!validSignature) {

                markPaymentFailed(
                        transaction,
                        "Razorpay signature verification failed"
                );

                throw new PaymentVerificationException(
                        "Payment signature verification failed"
                );
            }

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            keyId,
                            keySecret
                    );

            /*
             * Never trust only frontend data.
             */
            com.razorpay.Payment razorpayPayment =
                    razorpayClient.payments.fetch(
                            requestDto
                                    .getRazorpayPaymentId()
                    );

            validateRazorpayPayment(
                    razorpayPayment,
                    order,
                    requestDto
            );

            transaction.setRazorpayPaymentId(
                    requestDto.getRazorpayPaymentId()
            );

            transaction.setRazorpaySignature(
                    requestDto.getRazorpaySignature()
            );

            transaction.setStatus(
                    PaymentStatusEnum.SUCCESS
            );

            transaction.setFailureReason(null);

            order.setStatus(
                    OrderStatus.CONFIRMED
            );

            paymentRepository.save(
                    transaction
            );

            orderRepository.save(
                    order
            );

            return mapToResponseDTO(
                    transaction
            );

        } catch (PaymentVerificationException exception) {

            throw exception;

        } catch (PaymentGatewayException exception) {

            throw exception;

        } catch (Exception exception) {

            if (transaction.getStatus() !=
                    PaymentStatusEnum.SUCCESS) {

                markPaymentFailed(
                        transaction,
                        safeMessage(exception)
                );
            }

            throw new PaymentGatewayException(
                    "Payment verification failed",
                    exception
            );
        }
    }


    // =========================================================
    // GET PAYMENT STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentStatusByOrderId(
            String userEmail,
            Long orderId) {

        validateEmail(userEmail);
        validateOrderId(orderId);

        User user = getUser(userEmail);

        OrderEntity order =
                orderRepository
                        .findByIdAndUser(
                                orderId,
                                user
                        )
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Order not found"
                                )
                        );

        PaymentTransaction transaction =
                paymentRepository
                        .findByOrder(order)
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Payment transaction not found"
                                )
                        );

        return mapToResponseDTO(
                transaction
        );
    }


    // =========================================================
    // RECONCILE PAYMENT
    // =========================================================

    @Override
    @Transactional
    public PaymentResponseDTO reconcilePayment(
            String userEmail,
            Long orderId) {

        validateEmail(userEmail);
        validateOrderId(orderId);

        User user = getUser(userEmail);

        /*
         * ORDER LOCK FIRST
         */
        OrderEntity order =
                orderRepository
                        .findByIdForUpdate(orderId)
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Order not found"
                                )
                        );

        validateOrderOwnership(
                order,
                user
        );

        /*
         * PAYMENT LOCK SECOND
         */
        PaymentTransaction transaction =
                paymentRepository
                        .findByOrderForUpdate(order)
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Payment transaction not found"
                                )
                        );

        if (transaction.getStatus() ==
                PaymentStatusEnum.SUCCESS) {

            return mapToResponseDTO(
                    transaction
            );
        }

        if (transaction.getStatus() ==
                PaymentStatusEnum.REFUNDED) {

            return mapToResponseDTO(
                    transaction
            );
        }

        if (transaction.getStatus() ==
                PaymentStatusEnum.EXPIRED ||
                order.getStatus() ==
                        OrderStatus.CANCELLED) {

            throw new PaymentVerificationException(
                    "Expired or cancelled payment cannot be reconciled"
            );
        }

        validatePaymentWindow(order);

        try {

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            keyId,
                            keySecret
                    );

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.fetch(
                            transaction.getRazorpayOrderId()
                    );

            String razorpayStatus =
                    razorpayOrder.get("status");

            long razorpayAmount =
                    getRazorpayLongValue(
                            razorpayOrder,
                            "amount"
                    );

            if (razorpayAmount !=
                    transaction.getAmountInPaise()) {

                markPaymentFailed(
                        transaction,
                        "Razorpay amount does not match order amount"
                );

                throw new PaymentVerificationException(
                        "Payment amount mismatch"
                );
            }

            if ("paid".equalsIgnoreCase(
                    razorpayStatus
            )) {

                transaction.setStatus(
                        PaymentStatusEnum.SUCCESS
                );

                transaction.setFailureReason(null);

                if (order.getStatus() ==
                        OrderStatus.PENDING) {

                    order.setStatus(
                            OrderStatus.CONFIRMED
                    );

                    orderRepository.save(
                            order
                    );
                }

            } else if ("attempted".equalsIgnoreCase(
                    razorpayStatus
            )) {

                transaction.setStatus(
                        PaymentStatusEnum.CREATED
                );

            } else {

                transaction.setStatus(
                        PaymentStatusEnum.FAILED
                );

                transaction.setFailureReason(
                        "Razorpay order status: "
                                + razorpayStatus
                );
            }

            paymentRepository.save(
                    transaction
            );

            return mapToResponseDTO(
                    transaction
            );

        } catch (PaymentVerificationException exception) {

            throw exception;

        } catch (PaymentGatewayException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new PaymentGatewayException(
                    "Payment reconciliation failed",
                    exception
            );
        }
    }


    // =========================================================
    // FULL REFUND
    // =========================================================

    @Override
    @Transactional
    public PaymentResponseDTO refundPayment(
            String userEmail,
            Long orderId) {

        validateEmail(userEmail);
        validateOrderId(orderId);

        User user = getUser(userEmail);

        /*
         * ORDER LOCK FIRST
         */
        OrderEntity order =
                orderRepository
                        .findByIdForUpdate(orderId)
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Order not found"
                                )
                        );

        validateOrderOwnership(
                order,
                user
        );

        /*
         * PAYMENT LOCK SECOND
         */
        PaymentTransaction transaction =
                paymentRepository
                        .findByOrderForUpdate(order)
                        .orElseThrow(() ->
                                new PaymentNotFoundException(
                                        "Payment transaction not found"
                                )
                        );

        /*
         * IDEMPOTENCY
         */
        if (transaction.getStatus() ==
                PaymentStatusEnum.REFUNDED) {

            return mapToResponseDTO(
                    transaction
            );
        }

        if (transaction.getStatus() !=
                PaymentStatusEnum.SUCCESS) {

            throw new PaymentValidationException(
                    "Only successful payments can be refunded"
            );
        }

        if (transaction.getRazorpayPaymentId() == null ||
                transaction.getRazorpayPaymentId().isBlank()) {

            throw new PaymentValidationException(
                    "Razorpay payment ID is missing"
            );
        }

        if (transaction.getAmountInPaise() == null ||
                transaction.getAmountInPaise() <= 0) {

            throw new PaymentValidationException(
                    "Invalid payment amount"
            );
        }

        if (order.getStatus() ==
                OrderStatus.REFUNDED) {

            throw new PaymentValidationException(
                    "Order is already marked as refunded"
            );
        }

        try {

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            keyId,
                            keySecret
                    );

            /*
             * Verify actual Razorpay payment.
             */
            com.razorpay.Payment razorpayPayment =
                    razorpayClient.payments.fetch(
                            transaction.getRazorpayPaymentId()
                    );

            validateCapturedPaymentForRefund(
                    razorpayPayment,
                    transaction
            );

            /*
             * Build full refund request.
             */
            JSONObject refundRequest =
                    buildRefundRequest(
                            order,
                            transaction
                    );

            /*
             * IMPORTANT:
             *
             * Refund is called on RazorpayClient.payments,
             * not on the Payment response object.
             */
            Refund razorpayRefund =
                    razorpayClient.payments.refund(
                            transaction.getRazorpayPaymentId(),
                            refundRequest
                    );

            if (razorpayRefund == null) {

                throw new PaymentGatewayException(
                        "Razorpay did not return refund details",
                        null
                );
            }

            String refundId =
                    razorpayRefund.get("id");

            if (refundId == null ||
                    refundId.isBlank()) {

                throw new PaymentGatewayException(
                        "Razorpay did not return refund ID",
                        null
                );
            }

            long refundedAmount =
                    getRefundAmount(
                            razorpayRefund
                    );

            if (refundedAmount !=
                    transaction.getAmountInPaise()) {

                throw new PaymentGatewayException(
                        "Razorpay refund amount does not match payment amount",
                        null
                );
            }

            String refundPaymentId =
                    razorpayRefund.get(
                            "payment_id"
                    );

            if (refundPaymentId == null ||
                    !refundPaymentId.equals(
                            transaction.getRazorpayPaymentId()
                    )) {

                throw new PaymentGatewayException(
                        "Razorpay refund payment ID mismatch",
                        null
                );
            }

            /*
             * Save refund information.
             */
            transaction.setRazorpayRefundId(
                    refundId
            );

            transaction.setRefundedAmountInPaise(
                    refundedAmount
            );

            transaction.setRefundedAmountInRupees(
                    paiseToRupees(
                            refundedAmount
                    )
            );

            transaction.setStatus(
                    PaymentStatusEnum.REFUNDED
            );

            transaction.setFailureReason(null);

            paymentRepository.save(
                    transaction
            );

            /*
             * Payment is now refunded.
             */
            order.setStatus(
                    OrderStatus.REFUNDED
            );

            orderRepository.save(
                    order
            );

            return mapToResponseDTO(
                    transaction
            );

        } catch (PaymentValidationException exception) {

            throw exception;

        } catch (PaymentVerificationException exception) {

            throw exception;

        } catch (PaymentGatewayException exception) {

            throw exception;

        } catch (Exception exception) {

            /*
             * Do NOT mark payment REFUNDED here.
             *
             * If Razorpay failed, local payment remains SUCCESS.
             */
            throw new PaymentGatewayException(
                    "Razorpay refund failed",
                    exception
            );
        }
    }


    // =========================================================
    // RAZORPAY WEBHOOK
    // =========================================================

    @Override
    @Transactional
    public void handleRazorpayWebhook(
            String payload,
            String signature) {

        validateWebhookRequest(
                payload,
                signature
        );

        try {

            boolean validWebhook =
                    Utils.verifyWebhookSignature(
                            payload,
                            signature,
                            webhookSecret
                    );

            if (!validWebhook) {

                throw new PaymentVerificationException(
                        "Invalid Razorpay webhook signature"
                );
            }

            JSONObject json =
                    new JSONObject(payload);

            String event =
                    json.optString("event");

            switch (event) {

                case "payment.captured" ->
                        handlePaymentCaptured(json);

                case "payment.failed" ->
                        handlePaymentFailed(json);

                case "refund.processed" ->
                        handleRefundProcessed(json);

                case "refund.failed" ->
                        handleRefundFailed(json);

                default -> {
                    /*
                     * Ignore unsupported events.
                     */
                }
            }

        } catch (PaymentVerificationException exception) {

            throw exception;

        } catch (PaymentGatewayException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new PaymentGatewayException(
                    "Webhook handling failed",
                    exception
            );
        }
    }


    // =========================================================
    // WEBHOOK - PAYMENT CAPTURED
    // =========================================================

    private void handlePaymentCaptured(
            JSONObject json) {

        JSONObject entity =
                json.getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

        String razorpayOrderId =
                entity.getString("order_id");

        String razorpayPaymentId =
                entity.getString("id");

        PaymentTransaction existing =
                paymentRepository
                        .findByRazorpayOrderId(
                                razorpayOrderId
                        )
                        .orElse(null);

        if (existing == null ||
                existing.getOrder() == null) {

            return;
        }

        OrderEntity order =
                orderRepository
                        .findByIdForUpdate(
                                existing
                                        .getOrder()
                                        .getId()
                        )
                        .orElse(null);

        if (order == null) {
            return;
        }

        PaymentTransaction transaction =
                paymentRepository
                        .findByOrderForUpdate(order)
                        .orElse(null);

        if (transaction == null) {
            return;
        }

        /*
         * Idempotency.
         */
        if (transaction.getStatus() ==
                PaymentStatusEnum.SUCCESS) {

            return;
        }

        /*
         * Don't resurrect cancelled orders.
         */
        if (order.getStatus() !=
                OrderStatus.PENDING) {

            transaction.setFailureReason(
                    "Payment captured after order was no longer pending"
            );

            paymentRepository.save(
                    transaction
            );

            return;
        }

        /*
         * Don't accept payment after expiry.
         */
        if (isPaymentExpired(order)) {

            transaction.setStatus(
                    PaymentStatusEnum.EXPIRED
            );

            transaction.setFailureReason(
                    "Payment captured after payment window expired"
            );

            paymentRepository.save(
                    transaction
            );

            return;
        }

        long amount =
                entity.optLong(
                        "amount",
                        -1L
                );

        if (amount !=
                transaction.getAmountInPaise()) {

            markPaymentFailed(
                    transaction,
                    "Webhook payment amount mismatch"
            );

            return;
        }

        String currency =
                entity.optString(
                        "currency",
                        ""
                );

        if (!transaction.getCurrency()
                .equalsIgnoreCase(currency)) {

            markPaymentFailed(
                    transaction,
                    "Webhook payment currency mismatch"
            );

            return;
        }

        String status =
                entity.optString(
                        "status",
                        ""
                );

        if (!"captured".equalsIgnoreCase(status)) {
            return;
        }

        transaction.setStatus(
                PaymentStatusEnum.SUCCESS
        );

        transaction.setRazorpayPaymentId(
                razorpayPaymentId
        );

        transaction.setFailureReason(null);

        order.setStatus(
                OrderStatus.CONFIRMED
        );

        paymentRepository.save(
                transaction
        );

        orderRepository.save(
                order
        );
    }


    // =========================================================
    // WEBHOOK - PAYMENT FAILED
    // =========================================================

    private void handlePaymentFailed(
            JSONObject json) {

        JSONObject entity =
                json.getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

        String razorpayOrderId =
                entity.getString("order_id");

        String reason =
                entity.optString(
                        "error_description",
                        "Razorpay payment failed"
                );

        PaymentTransaction existing =
                paymentRepository
                        .findByRazorpayOrderId(
                                razorpayOrderId
                        )
                        .orElse(null);

        if (existing == null ||
                existing.getOrder() == null) {

            return;
        }

        OrderEntity order =
                orderRepository
                        .findByIdForUpdate(
                                existing
                                        .getOrder()
                                        .getId()
                        )
                        .orElse(null);

        if (order == null) {
            return;
        }

        PaymentTransaction transaction =
                paymentRepository
                        .findByOrderForUpdate(order)
                        .orElse(null);

        if (transaction == null) {
            return;
        }

        /*
         * Never overwrite SUCCESS.
         */
        if (transaction.getStatus() ==
                PaymentStatusEnum.SUCCESS) {

            return;
        }

        /*
         * Never overwrite EXPIRED.
         */
        if (transaction.getStatus() ==
                PaymentStatusEnum.EXPIRED) {

            return;
        }

        markPaymentFailed(
                transaction,
                reason
        );
    }


    // =========================================================
    // WEBHOOK - REFUND PROCESSED
    // =========================================================

    private void handleRefundProcessed(
            JSONObject json) {

        JSONObject entity =
                json.getJSONObject("payload")
                        .getJSONObject("refund")
                        .getJSONObject("entity");

        String refundId =
                entity.optString(
                        "id",
                        ""
                );

        String paymentId =
                entity.optString(
                        "payment_id",
                        ""
                );

        if (refundId.isBlank() ||
                paymentId.isBlank()) {

            return;
        }

        PaymentTransaction existing =
                paymentRepository
                        .findByRazorpayPaymentId(
                                paymentId
                        )
                        .orElse(null);

        if (existing == null ||
                existing.getOrder() == null) {

            return;
        }

        OrderEntity order =
                orderRepository
                        .findByIdForUpdate(
                                existing
                                        .getOrder()
                                        .getId()
                        )
                        .orElse(null);

        if (order == null) {
            return;
        }

        PaymentTransaction transaction =
                paymentRepository
                        .findByOrderForUpdate(order)
                        .orElse(null);

        if (transaction == null) {
            return;
        }

        /*
         * Idempotency.
         */
        if (transaction.getStatus() ==
                PaymentStatusEnum.REFUNDED) {

            return;
        }

        long refundAmount =
                entity.optLong(
                        "amount",
                        -1L
                );

        if (refundAmount <= 0) {
            return;
        }

        if (refundAmount !=
                transaction.getAmountInPaise()) {

            return;
        }

        transaction.setRazorpayRefundId(
                refundId
        );

        transaction.setRefundedAmountInPaise(
                refundAmount
        );

        transaction.setRefundedAmountInRupees(
                paiseToRupees(
                        refundAmount
                )
        );

        transaction.setStatus(
                PaymentStatusEnum.REFUNDED
        );

        transaction.setFailureReason(null);

        paymentRepository.save(
                transaction
        );

        order.setStatus(
                OrderStatus.REFUNDED
        );

        orderRepository.save(
                order
        );
    }


    // =========================================================
    // WEBHOOK - REFUND FAILED
    // =========================================================

    private void handleRefundFailed(
            JSONObject json) {

        JSONObject entity =
                json.getJSONObject("payload")
                        .getJSONObject("refund")
                        .getJSONObject("entity");

        String paymentId =
                entity.optString(
                        "payment_id",
                        ""
                );

        String reason =
                entity.optString(
                        "failure_reason",
                        "Razorpay refund failed"
                );

        if (paymentId.isBlank()) {
            return;
        }

        PaymentTransaction existing =
                paymentRepository
                        .findByRazorpayPaymentId(
                                paymentId
                        )
                        .orElse(null);

        if (existing == null ||
                existing.getOrder() == null) {

            return;
        }

        OrderEntity order =
                orderRepository
                        .findByIdForUpdate(
                                existing
                                        .getOrder()
                                        .getId()
                        )
                        .orElse(null);

        if (order == null) {
            return;
        }

        PaymentTransaction transaction =
                paymentRepository
                        .findByOrderForUpdate(order)
                        .orElse(null);

        if (transaction == null) {
            return;
        }

        /*
         * Don't overwrite successful refund.
         */
        if (transaction.getStatus() ==
                PaymentStatusEnum.REFUNDED) {

            return;
        }

        /*
         * Payment was successful but refund failed.
         */
        transaction.setStatus(
                PaymentStatusEnum.SUCCESS
        );

        transaction.setFailureReason(
                reason
        );

        paymentRepository.save(
                transaction
        );
    }


    // =========================================================
    // REFUND REQUEST
    // =========================================================

    private JSONObject buildRefundRequest(
            OrderEntity order,
            PaymentTransaction transaction) {

        JSONObject request =
                new JSONObject();

        request.put(
                "amount",
                transaction.getAmountInPaise()
        );

        request.put(
                "speed",
                "normal"
        );

        request.put(
                "receipt",
                order.getOrderNumber()
        );

        JSONObject notes =
                new JSONObject();

        notes.put(
                "order_number",
                order.getOrderNumber()
        );

        notes.put(
                "reason",
                "Order refund"
        );

        request.put(
                "notes",
                notes
        );

        return request;
    }


    // =========================================================
    // CAPTURED PAYMENT VALIDATION
    // =========================================================

    private void validateCapturedPaymentForRefund(
            com.razorpay.Payment payment,
            PaymentTransaction transaction) {

        if (payment == null) {

            throw new PaymentVerificationException(
                    "Razorpay payment was not found"
            );
        }

        String paymentId =
                payment.get("id");

        if (paymentId == null ||
                !paymentId.equals(
                        transaction.getRazorpayPaymentId()
                )) {

            throw new PaymentVerificationException(
                    "Razorpay payment ID mismatch"
            );
        }

        String status =
                payment.get("status");

        if (!"captured".equalsIgnoreCase(status)) {

            throw new PaymentValidationException(
                    "Razorpay payment is not captured"
            );
        }

        long amount =
                getRazorpayLongValue(
                        payment,
                        "amount"
                );

        if (amount !=
                transaction.getAmountInPaise()) {

            throw new PaymentVerificationException(
                    "Razorpay payment amount does not match transaction amount"
            );
        }

        String currency =
                payment.get("currency");

        if (!transaction.getCurrency()
                .equalsIgnoreCase(currency)) {

            throw new PaymentVerificationException(
                    "Razorpay payment currency does not match transaction currency"
            );
        }
    }


    // =========================================================
    // RAZORPAY PAYMENT VALIDATION
    // =========================================================

    private void validateRazorpayPayment(
            com.razorpay.Payment payment,
            OrderEntity order,
            VerifyPaymentRequestDTO request) {

        if (payment == null) {

            throw new PaymentVerificationException(
                    "Razorpay payment was not found"
            );
        }

        String paymentId =
                payment.get("id");

        String razorpayOrderId =
                payment.get("order_id");

        long amount =
                getRazorpayLongValue(
                        payment,
                        "amount"
                );

        String currency =
                payment.get("currency");

        String status =
                payment.get("status");

        if (!request.getRazorpayPaymentId()
                .equals(paymentId)) {

            throw new PaymentVerificationException(
                    "Razorpay payment ID mismatch"
            );
        }

        if (!request.getRazorpayOrderId()
                .equals(razorpayOrderId)) {

            throw new PaymentVerificationException(
                    "Razorpay order ID mismatch"
            );
        }

        long expectedAmount =
                convertToPaise(
                        order.getTotalAmount()
                );

        if (amount != expectedAmount) {

            throw new PaymentVerificationException(
                    "Payment amount does not match order amount"
            );
        }

        if (!order.getCurrency()
                .equalsIgnoreCase(currency)) {

            throw new PaymentVerificationException(
                    "Payment currency does not match order currency"
            );
        }

        if (!"captured".equalsIgnoreCase(status)) {

            throw new PaymentVerificationException(
                    "Razorpay payment is not captured"
            );
        }
    }


    // =========================================================
    // REFUND AMOUNT
    // =========================================================

    private long getRefundAmount(
            Refund refund) {

        Object value =
                refund.get("amount");

        if (value == null) {

            throw new PaymentVerificationException(
                    "Razorpay refund amount is missing"
            );
        }

        try {

            return Long.parseLong(
                    String.valueOf(value)
            );

        } catch (NumberFormatException exception) {

            throw new PaymentVerificationException(
                    "Invalid Razorpay refund amount"
            );
        }
    }


    // =========================================================
    // RAZORPAY AMOUNT
    // =========================================================

    private long getRazorpayLongValue(
            Object razorpayObject,
            String field) {

        Object value;

        if (razorpayObject instanceof
                com.razorpay.Payment payment) {

            value = payment.get(field);

        } else if (razorpayObject instanceof
                com.razorpay.Order order) {

            value = order.get(field);

        } else {

            throw new PaymentVerificationException(
                    "Unsupported Razorpay response"
            );
        }

        if (value == null) {

            throw new PaymentVerificationException(
                    "Razorpay "
                            + field
                            + " is missing"
            );
        }

        try {

            return Long.parseLong(
                    String.valueOf(value)
            );

        } catch (NumberFormatException exception) {

            throw new PaymentVerificationException(
                    "Invalid Razorpay "
                            + field
            );
        }
    }


    // =========================================================
    // RUPEES → PAISE
    // =========================================================

    private long convertToPaise(
            BigDecimal amount) {

        if (amount == null) {

            throw new PaymentValidationException(
                    "Payment amount is required"
            );
        }

        try {

            return amount
                    .setScale(
                            2,
                            RoundingMode.UNNECESSARY
                    )
                    .multiply(HUNDRED)
                    .longValueExact();

        } catch (ArithmeticException exception) {

            throw new PaymentValidationException(
                    "Invalid payment amount"
            );
        }
    }


    // =========================================================
    // PAISE → RUPEES
    // =========================================================

    private BigDecimal paiseToRupees(
            long amountInPaise) {

        if (amountInPaise < 0) {

            throw new PaymentValidationException(
                    "Refund amount cannot be negative"
            );
        }

        return BigDecimal
                .valueOf(amountInPaise)
                .divide(
                        HUNDRED,
                        2,
                        RoundingMode.HALF_UP
                );
    }


    // =========================================================
    // PAYMENT FAILURE
    // =========================================================

    private void markPaymentFailed(
            PaymentTransaction transaction,
            String reason) {

        transaction.setStatus(
                PaymentStatusEnum.FAILED
        );

        transaction.setFailureReason(
                reason
        );

        paymentRepository.save(
                transaction
        );
    }


    // =========================================================
    // PAYMENT OWNERSHIP
    // =========================================================

    private void validatePaymentBelongsToOrder(
            PaymentTransaction transaction,
            OrderEntity order) {

        if (transaction.getOrder() == null ||
                transaction.getOrder().getId() == null ||
                !transaction.getOrder()
                        .getId()
                        .equals(order.getId())) {

            throw new PaymentVerificationException(
                    "Payment transaction does not belong to this order"
            );
        }
    }


    // =========================================================
    // ORDER OWNERSHIP
    // =========================================================

    private void validateOrderOwnership(
            OrderEntity order,
            User user) {

        if (order == null ||
                order.getUser() == null ||
                order.getUser().getId() == null ||
                user == null ||
                user.getId() == null ||
                !order.getUser()
                        .getId()
                        .equals(user.getId())) {

            throw new PaymentNotFoundException(
                    "Order not found"
            );
        }
    }


    // =========================================================
    // USER
    // =========================================================

    private User getUser(
            String email) {

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new PaymentNotFoundException(
                                "User not found"
                        )
                );
    }


    // =========================================================
    // EMAIL VALIDATION
    // =========================================================

    private void validateEmail(
            String email) {

        if (email == null ||
                email.isBlank()) {

            throw new PaymentValidationException(
                    "User email is required"
            );
        }
    }


    // =========================================================
    // CREATE REQUEST VALIDATION
    // =========================================================

    private void validateCreateRequest(
            CreatePaymentRequestDTO request) {

        if (request == null) {

            throw new PaymentValidationException(
                    "Payment creation request is required"
            );
        }

        validateOrderId(
                request.getOrderId()
        );
    }


    // =========================================================
    // VERIFY REQUEST VALIDATION
    // =========================================================

    private void validateVerifyRequest(
            VerifyPaymentRequestDTO request) {

        if (request == null) {

            throw new PaymentValidationException(
                    "Payment verification request is required"
            );
        }

        validateOrderId(
                request.getOrderId()
        );

        if (request.getRazorpayOrderId() == null ||
                request.getRazorpayOrderId().isBlank()) {

            throw new PaymentValidationException(
                    "Razorpay Order ID is required"
            );
        }

        if (request.getRazorpayPaymentId() == null ||
                request.getRazorpayPaymentId().isBlank()) {

            throw new PaymentValidationException(
                    "Razorpay Payment ID is required"
            );
        }

        if (request.getRazorpaySignature() == null ||
                request.getRazorpaySignature().isBlank()) {

            throw new PaymentValidationException(
                    "Razorpay Signature is required"
            );
        }
    }


    // =========================================================
    // ORDER ID VALIDATION
    // =========================================================

    private void validateOrderId(
            Long orderId) {

        if (orderId == null ||
                orderId <= 0) {

            throw new PaymentValidationException(
                    "Valid Order ID is required"
            );
        }
    }


    // =========================================================
    // PAYMENT WINDOW
    // =========================================================

    private void validatePaymentWindow(
            OrderEntity order) {

        if (order.getPaymentExpiresAt() == null) {

            throw new PaymentValidationException(
                    "Payment expiry time is not configured"
            );
        }

        if (!order.getPaymentExpiresAt()
                .isAfter(
                        LocalDateTime.now()
                )) {

            throw new PaymentVerificationException(
                    "Payment window has expired"
            );
        }
    }


    private boolean isPaymentExpired(
            OrderEntity order) {

        return order.getPaymentExpiresAt() == null ||
                !order.getPaymentExpiresAt()
                        .isAfter(
                                LocalDateTime.now()
                        );
    }


    // =========================================================
    // WEBHOOK VALIDATION
    // =========================================================

    private void validateWebhookRequest(
            String payload,
            String signature) {

        if (payload == null ||
                payload.isBlank()) {

            throw new PaymentValidationException(
                    "Webhook payload is required"
            );
        }

        if (signature == null ||
                signature.isBlank()) {

            throw new PaymentValidationException(
                    "Webhook signature is required"
            );
        }

        if (webhookSecret == null ||
                webhookSecret.isBlank()) {

            throw new PaymentValidationException(
                    "Razorpay webhook secret is not configured"
            );
        }
    }


    // =========================================================
    // SAFE ERROR MESSAGE
    // =========================================================

    private String safeMessage(
            Exception exception) {

        if (exception == null ||
                exception.getMessage() == null ||
                exception.getMessage().isBlank()) {

            return "Payment processing failed";
        }

        return exception.getMessage();
    }


    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private PaymentResponseDTO mapToResponseDTO(
            PaymentTransaction transaction) {

        if (transaction == null ||
                transaction.getOrder() == null) {

            throw new PaymentValidationException(
                    "Invalid payment transaction"
            );
        }

        return PaymentResponseDTO
                .builder()
                .transactionId(
                        transaction.getId()
                )
                .orderId(
                        transaction
                                .getOrder()
                                .getId()
                )
                .orderNumber(
                        transaction
                                .getOrder()
                                .getOrderNumber()
                )
                .razorpayOrderId(
                        transaction
                                .getRazorpayOrderId()
                )
                .razorpayPaymentId(
                        transaction
                                .getRazorpayPaymentId()
                )
                .razorpayRefundId(
                        transaction
                                .getRazorpayRefundId()
                )
                .amount(
                        transaction
                                .getAmountInRupees()
                )
                .refundedAmount(
                        transaction
                                .getRefundedAmountInRupees()
                )
                .currency(
                        transaction
                                .getCurrency()
                )
                .status(
                        transaction
                                .getStatus()
                )
                .createdAt(
                        transaction
                                .getCreatedAt()
                )
                .build();
    }
}