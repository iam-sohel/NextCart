package com.nextcart.nextcart.payment_module.service;

import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.order_module.OrderRepository;
import com.nextcart.nextcart.order_module.OrderStatus;
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
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

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
            CreatePaymentRequestDTO requestDto
    ) {

        User user = getUser(userEmail);

        if (requestDto == null
                || requestDto.getOrderId() == null) {

            throw new IllegalArgumentException(
                    "Order ID is required"
            );
        }

        OrderEntity order =
                orderRepository
                        .findByIdAndUser(
                                requestDto.getOrderId(),
                                user
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found or access denied"
                                )
                        );

        /*
         * Payment can only be created for a pending order.
         *
         * Order flow:
         *
         * PENDING
         *    ↓
         * Razorpay
         *    ↓
         * SUCCESS
         *    ↓
         * CONFIRMED
         */
        if (order.getStatus() != OrderStatus.PENDING) {

            throw new IllegalStateException(
                    "Payment can only be created for a PENDING order"
            );
        }

        if (order.getTotalAmount() == null
                || order.getTotalAmount()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "Order total amount must be greater than zero"
            );
        }

        /*
         * Prevent creating multiple payment transactions
         * for the same order.
         */
        if (paymentRepository
                .findByOrder(order)
                .isPresent()) {

            throw new IllegalStateException(
                    "Payment transaction already exists for this order"
            );
        }

        long amountInPaise =
                order.getTotalAmount()
                        .multiply(BigDecimal.valueOf(100))
                        .longValueExact();

        try {

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            keyId,
                            keySecret
                    );

            JSONObject orderRequest =
                    new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    order.getCurrency()
            );

            orderRequest.put(
                    "receipt",
                    order.getOrderNumber()
            );

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.create(
                            orderRequest
                    );

            String razorpayOrderId =
                    razorpayOrder.get("id");

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

            paymentRepository.save(transaction);

            return CreatePaymentResponseDTO.builder()
                    .orderId(order.getId())
                    .orderNumber(
                            order.getOrderNumber()
                    )
                    .razorpayOrderId(
                            razorpayOrderId
                    )
                    .amount(amountInPaise)
                    .currency(
                            order.getCurrency()
                    )
                    .keyId(keyId)
                    .build();

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Razorpay order creation failed",
                    e
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
            VerifyPaymentRequestDTO requestDto
    ) {

        User user = getUser(userEmail);

        validateVerifyRequest(requestDto);

        OrderEntity order =
                orderRepository
                        .findByIdAndUser(
                                requestDto.getOrderId(),
                                user
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found or access denied"
                                )
                        );

        PaymentTransaction transaction =
                paymentRepository
                        .findByRazorpayOrderId(
                                requestDto.getRazorpayOrderId()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment transaction not found"
                                )
                        );

        /*
         * Make sure the Razorpay transaction belongs
         * to the requested order.
         */
        if (!transaction
                .getOrder()
                .getId()
                .equals(order.getId())) {

            throw new IllegalArgumentException(
                    "Payment transaction does not belong to this order"
            );
        }

        /*
         * Idempotency:
         *
         * If Razorpay verification is called again after
         * successful verification, simply return the
         * existing successful transaction.
         */
        if (transaction.getStatus()
                == PaymentStatusEnum.SUCCESS) {

            return mapToResponseDTO(transaction);
        }

        try {

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

                transaction.setStatus(
                        PaymentStatusEnum.FAILED
                );

                transaction.setFailureReason(
                        "Razorpay signature verification failed"
                );

                paymentRepository.save(transaction);

                throw new IllegalArgumentException(
                        "Payment signature verification failed"
                );
            }

            /*
             * Never allow a payment to confirm an order
             * that is no longer pending.
             */
            if (order.getStatus()
                    != OrderStatus.PENDING) {

                throw new IllegalStateException(
                        "Order is no longer in PENDING status"
                );
            }

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

            /*
             * Payment success confirms the order.
             */
            order.setStatus(
                    OrderStatus.CONFIRMED
            );

            paymentRepository.save(transaction);
            orderRepository.save(order);

            return mapToResponseDTO(transaction);

        } catch (IllegalArgumentException
                 | IllegalStateException e) {

            throw e;

        } catch (Exception e) {

            transaction.setStatus(
                    PaymentStatusEnum.FAILED
            );

            transaction.setFailureReason(
                    e.getMessage()
            );

            paymentRepository.save(transaction);

            throw new IllegalStateException(
                    "Payment verification failed",
                    e
            );
        }
    }


    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentStatusByOrderId(
            String userEmail,
            Long orderId
    ) {

        User user = getUser(userEmail);

        if (orderId == null || orderId <= 0) {

            throw new IllegalArgumentException(
                    "Invalid order ID"
            );
        }

        OrderEntity order =
                orderRepository
                        .findByIdAndUser(
                                orderId,
                                user
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found or access denied"
                                )
                        );

        PaymentTransaction transaction =
                paymentRepository
                        .findByOrder(order)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No payment transaction found for this order"
                                )
                        );

        return mapToResponseDTO(transaction);
    }


    // =========================================================
    // RECONCILE PAYMENT
    // =========================================================

    @Override
    @Transactional
    public PaymentResponseDTO reconcilePayment(
            String userEmail,
            Long orderId
    ) {

        User user = getUser(userEmail);

        if (orderId == null || orderId <= 0) {

            throw new IllegalArgumentException(
                    "Invalid order ID"
            );
        }

        OrderEntity order =
                orderRepository
                        .findByIdAndUser(
                                orderId,
                                user
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found or access denied"
                                )
                        );

        PaymentTransaction transaction =
                paymentRepository
                        .findByOrder(order)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "No payment transaction found for this order"
                                )
                        );

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

            if ("paid".equalsIgnoreCase(
                    razorpayStatus
            )) {

                transaction.setStatus(
                        PaymentStatusEnum.SUCCESS
                );

                transaction.setFailureReason(null);

                /*
                 * Only confirm an order that is still
                 * awaiting payment.
                 */
                if (order.getStatus()
                        == OrderStatus.PENDING) {

                    order.setStatus(
                            OrderStatus.CONFIRMED
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
                        "Razorpay payment status: "
                                + razorpayStatus
                );
            }

            paymentRepository.save(transaction);
            orderRepository.save(order);

            return mapToResponseDTO(transaction);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Payment reconciliation failed",
                    e
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
            String signature
    ) {

        if (payload == null
                || payload.isBlank()) {

            throw new IllegalArgumentException(
                    "Webhook payload is required"
            );
        }

        if (signature == null
                || signature.isBlank()) {

            throw new IllegalArgumentException(
                    "Webhook signature is required"
            );
        }

        try {

            boolean validWebhook =
                    Utils.verifyWebhookSignature(
                            payload,
                            signature,
                            webhookSecret
                    );

            if (!validWebhook) {

                throw new IllegalArgumentException(
                        "Invalid Razorpay webhook signature"
                );
            }

            JSONObject jsonObject =
                    new JSONObject(payload);

            String event =
                    jsonObject.getString("event");

            /*
             * Payment captured.
             */
            if ("payment.captured".equals(event)) {

                handlePaymentCaptured(
                        jsonObject
                );
            }

            /*
             * Payment failed.
             */
            else if ("payment.failed".equals(event)) {

                handlePaymentFailed(
                        jsonObject
                );
            }

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Webhook handling failed",
                    e
            );
        }
    }


    // =========================================================
    // WEBHOOK - PAYMENT CAPTURED
    // =========================================================

    private void handlePaymentCaptured(
            JSONObject jsonObject
    ) {

        JSONObject paymentEntity =
                jsonObject
                        .getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

        String razorpayOrderId =
                paymentEntity.getString(
                        "order_id"
                );

        String razorpayPaymentId =
                paymentEntity.getString(
                        "id"
                );

        paymentRepository
                .findByRazorpayOrderId(
                        razorpayOrderId
                )
                .ifPresent(transaction -> {

                    /*
                     * Idempotent webhook handling.
                     */
                    if (transaction.getStatus()
                            == PaymentStatusEnum.SUCCESS) {

                        return;
                    }

                    transaction.setStatus(
                            PaymentStatusEnum.SUCCESS
                    );

                    transaction.setRazorpayPaymentId(
                            razorpayPaymentId
                    );

                    transaction.setFailureReason(
                            null
                    );

                    OrderEntity order =
                            transaction.getOrder();

                    /*
                     * Webhook confirms only a pending order.
                     */
                    if (order != null
                            && order.getStatus()
                            == OrderStatus.PENDING) {

                        order.setStatus(
                                OrderStatus.CONFIRMED
                        );

                        orderRepository.save(order);
                    }

                    paymentRepository.save(
                            transaction
                    );
                });
    }


    // =========================================================
    // WEBHOOK - PAYMENT FAILED
    // =========================================================

    private void handlePaymentFailed(
            JSONObject jsonObject
    ) {

        JSONObject paymentEntity =
                jsonObject
                        .getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

        String razorpayOrderId =
                paymentEntity.getString(
                        "order_id"
                );

        String reason = null;

        if (paymentEntity.has("error_description")) {

            reason =
                    paymentEntity.getString(
                            "error_description"
                    );
        }

        String finalReason = reason;

        paymentRepository
                .findByRazorpayOrderId(
                        razorpayOrderId
                )
                .ifPresent(transaction -> {

                    /*
                     * Do not overwrite a successful
                     * transaction with FAILED.
                     */
                    if (transaction.getStatus()
                            == PaymentStatusEnum.SUCCESS) {

                        return;
                    }

                    transaction.setStatus(
                            PaymentStatusEnum.FAILED
                    );

                    transaction.setFailureReason(
                            finalReason
                    );

                    paymentRepository.save(
                            transaction
                    );
                });
    }


    // =========================================================
    // USER
    // =========================================================

    private User getUser(
            String email
    ) {

        if (email == null
                || email.isBlank()) {

            throw new IllegalArgumentException(
                    "User email is required"
            );
        }

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );
    }


    // =========================================================
    // VERIFY REQUEST VALIDATION
    // =========================================================

    private void validateVerifyRequest(
            VerifyPaymentRequestDTO request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Payment verification request is required"
            );
        }

        if (request.getOrderId() == null
                || request.getOrderId() <= 0) {

            throw new IllegalArgumentException(
                    "Order ID is required"
            );
        }

        if (request.getRazorpayOrderId() == null
                || request.getRazorpayOrderId().isBlank()) {

            throw new IllegalArgumentException(
                    "Razorpay Order ID is required"
            );
        }

        if (request.getRazorpayPaymentId() == null
                || request.getRazorpayPaymentId().isBlank()) {

            throw new IllegalArgumentException(
                    "Razorpay Payment ID is required"
            );
        }

        if (request.getRazorpaySignature() == null
                || request.getRazorpaySignature().isBlank()) {

            throw new IllegalArgumentException(
                    "Razorpay Signature is required"
            );
        }
    }


    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private PaymentResponseDTO mapToResponseDTO(
            PaymentTransaction transaction
    ) {

        return PaymentResponseDTO.builder()
                .transactionId(
                        transaction.getId()
                )
                .orderId(
                        transaction.getOrder().getId()
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
                .amount(
                        transaction
                                .getAmountInRupees()
                )
                .currency(
                        transaction.getCurrency()
                )
                .status(
                        transaction.getStatus()
                )
                .createdAt(
                        transaction.getCreatedAt()
                )
                .build();
    }
}