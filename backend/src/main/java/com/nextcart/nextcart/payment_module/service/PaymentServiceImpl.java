package com.nextcart.nextcart.payment_module.service;

import com.nextcart.nextcart.order_module.entity.Order;
import com.nextcart.nextcart.order_module.entity.PaymentStatus;
import com.nextcart.nextcart.order_module.repository.OrderRepository;
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

    private static final String INR = "INR";
    private static final String RAZORPAY = "RAZORPAY";

    private final PaymentTransactionRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @Override
    @Transactional
    public CreatePaymentResponseDTO createRazorpayOrder(
            String userEmail,
            CreatePaymentRequestDTO requestDto) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Order order = orderRepository.findByIdAndUser(
                        requestDto.getOrderId(),
                        user
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found or access denied"
                        )
                );

        if (order.getTotalAmount() == null) {
            throw new RuntimeException(
                    "Order total amount is missing"
            );
        }

        if (order.getTotalAmount().signum() <= 0) {
            throw new RuntimeException(
                    "Order total amount must be greater than zero"
            );
        }

        /*
         * Payment creation is explicitly Razorpay based.
         * Keep the order contract unchanged.
         */
        if (!RAZORPAY.equalsIgnoreCase(order.getPaymentMethod())) {
            order.setPaymentMethod(RAZORPAY);
            orderRepository.save(order);
        }

        /*
         * If this order is already successfully paid,
         * never create another Razorpay order.
         */
        if (PaymentStatus.COMPLETED.equals(order.getPaymentStatus())) {
            throw new RuntimeException(
                    "Order payment is already completed"
            );
        }

        /*
         * Reuse an existing transaction for this order when possible.
         *
         * This prevents simple frontend retries from creating
         * unnecessary Razorpay orders.
         */
        var existingTransaction = paymentRepository.findByOrder(order);

        if (existingTransaction.isPresent()) {

            PaymentTransaction transaction =
                    existingTransaction.get();

            if (transaction.getStatus() == PaymentStatusEnum.SUCCESS) {
                throw new RuntimeException(
                        "Payment for this order is already completed"
                );
            }

            if (transaction.getStatus() == PaymentStatusEnum.CREATED
                    && transaction.getRazorpayOrderId() != null) {

                return CreatePaymentResponseDTO.builder()
                        .orderId(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .razorpayOrderId(
                                transaction.getRazorpayOrderId()
                        )
                        .amount(transaction.getAmountInPaise())
                        .currency(transaction.getCurrency())
                        .keyId(keyId)
                        .build();
            }
        }

        long amountInPaise = order.getTotalAmount()
                .multiply(new BigDecimal("100"))
                .longValueExact();

        try {
            RazorpayClient razorpayClient =
                    new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", INR);
            orderRequest.put(
                    "receipt",
                    order.getOrderNumber()
            );

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.create(orderRequest);

            String razorpayOrderId =
                    razorpayOrder.get("id");

            if (razorpayOrderId == null
                    || razorpayOrderId.isBlank()) {

                throw new RuntimeException(
                        "Razorpay did not return an order ID"
                );
            }

            PaymentTransaction transaction =
                    PaymentTransaction.builder()
                            .user(user)
                            .order(order)
                            .razorpayOrderId(razorpayOrderId)
                            .amountInPaise(amountInPaise)
                            .amountInRupees(
                                    order.getTotalAmount()
                            )
                            .currency(INR)
                            .status(PaymentStatusEnum.CREATED)
                            .build();

            paymentRepository.save(transaction);

            return CreatePaymentResponseDTO.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .razorpayOrderId(razorpayOrderId)
                    .amount(amountInPaise)
                    .currency(INR)
                    .keyId(keyId)
                    .build();

        } catch (ArithmeticException e) {
            throw new RuntimeException(
                    "Invalid order amount for payment"
            );
        } catch (Exception e) {
            throw new RuntimeException(
                    "Razorpay order creation failed: "
                            + safeMessage(e)
            );
        }
    }

    @Override
    @Transactional
    public PaymentResponseDTO verifyPayment(
            String userEmail,
            VerifyPaymentRequestDTO requestDto) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Order order = orderRepository.findByIdAndUser(
                        requestDto.getOrderId(),
                        user
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found or access denied"
                        )
                );

        PaymentTransaction transaction =
                paymentRepository
                        .findByRazorpayOrderId(
                                requestDto.getRazorpayOrderId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Transaction not found for Razorpay Order ID"
                                )
                        );

        /*
         * CRITICAL SECURITY CHECK:
         *
         * The Razorpay order ID supplied by the client must belong
         * to the exact NextCart order being verified.
         */
        if (transaction.getOrder() == null
                || !order.getId().equals(
                        transaction.getOrder().getId()
                )) {

            throw new RuntimeException(
                    "Payment transaction does not belong to this order"
            );
        }

        /*
         * Also verify the transaction belongs to the authenticated user.
         */
        if (transaction.getUser() == null
                || !user.getId().equals(
                        transaction.getUser().getId()
                )) {

            throw new RuntimeException(
                    "Payment transaction does not belong to this user"
            );
        }

        /*
         * Idempotent success handling.
         *
         * A retry after a successful verification should not turn
         * the transaction into FAILED.
         */
        if (transaction.getStatus() == PaymentStatusEnum.SUCCESS) {

            if (requestDto.getRazorpayPaymentId() != null
                    && transaction.getRazorpayPaymentId() != null
                    && !transaction.getRazorpayPaymentId().equals(
                            requestDto.getRazorpayPaymentId()
                    )) {

                throw new RuntimeException(
                        "Transaction is already completed with a different payment ID"
                );
            }

            if (!PaymentStatus.COMPLETED.equals(
                    order.getPaymentStatus()
            )) {
                order.setPaymentStatus(
                        PaymentStatus.COMPLETED
                );
                orderRepository.save(order);
            }

            return mapToResponseDTO(transaction);
        }

        /*
         * Only CREATED transactions may be verified normally.
         */
        if (transaction.getStatus() != PaymentStatusEnum.CREATED) {
            throw new RuntimeException(
                    "Payment transaction cannot be verified from status: "
                            + transaction.getStatus()
            );
        }

        /*
         * Amount consistency check.
         *
         * The amount verified here comes from our persisted
         * PaymentTransaction, which was created from the Order.
         */
        long expectedAmountInPaise = order.getTotalAmount()
                .multiply(new BigDecimal("100"))
                .longValueExact();

        if (transaction.getAmountInPaise() == null
                || transaction.getAmountInPaise()
                != expectedAmountInPaise) {

            throw new RuntimeException(
                    "Payment amount does not match the order amount"
            );
        }

        try {
            JSONObject attributes = new JSONObject();

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

            boolean isValidSignature =
                    Utils.verifyPaymentSignature(
                            attributes,
                            keySecret
                    );

            if (!isValidSignature) {
                markTransactionFailed(
                        transaction,
                        "Signature verification failed"
                );

                throw new RuntimeException(
                        "Payment signature verification failed"
                );
            }

            transaction.setRazorpayPaymentId(
                    requestDto.getRazorpayPaymentId()
            );

            transaction.setRazorpaySignature(
                    requestDto.getRazorpaySignature()
            );

            transaction.setFailureReason(null);
            transaction.setStatus(
                    PaymentStatusEnum.SUCCESS
            );

            paymentRepository.save(transaction);

            order.setPaymentStatus(
                    PaymentStatus.COMPLETED
            );

            orderRepository.save(order);

            return mapToResponseDTO(transaction);

        } catch (RuntimeException e) {

            /*
             * Do not convert an already successful transaction
             * into FAILED because of a later exception.
             */
            if (transaction.getStatus() != PaymentStatusEnum.SUCCESS
                    && transaction.getStatus() != PaymentStatusEnum.FAILED) {

                markTransactionFailed(
                        transaction,
                        safeMessage(e)
                );
            }

            throw e;

        } catch (Exception e) {

            if (transaction.getStatus() != PaymentStatusEnum.SUCCESS) {
                markTransactionFailed(
                        transaction,
                        safeMessage(e)
                );
            }

            throw new RuntimeException(
                    "Payment verification exception: "
                            + safeMessage(e)
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentStatusByOrderId(
            String userEmail,
            Long orderId) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Order order = orderRepository.findByIdAndUser(
                        orderId,
                        user
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found or access denied"
                        )
                );

        PaymentTransaction transaction =
                paymentRepository.findByOrder(order)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No payment transaction found for this order"
                                )
                        );

        return mapToResponseDTO(transaction);
    }

    @Override
    @Transactional
    public PaymentResponseDTO reconcilePayment(
            String userEmail,
            Long orderId) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Order order = orderRepository.findByIdAndUser(
                        orderId,
                        user
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found or access denied"
                        )
                );

        PaymentTransaction transaction =
                paymentRepository.findByOrder(order)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No transaction found to reconcile"
                                )
                        );

        /*
         * A successful payment is terminal for this flow.
         * Reconciliation should not downgrade it.
         */
        if (transaction.getStatus()
                == PaymentStatusEnum.SUCCESS) {

            if (!PaymentStatus.COMPLETED.equals(
                    order.getPaymentStatus()
            )) {
                order.setPaymentStatus(
                        PaymentStatus.COMPLETED
                );
                orderRepository.save(order);
            }

            return mapToResponseDTO(transaction);
        }

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

            if ("paid".equalsIgnoreCase(razorpayStatus)) {

                transaction.setStatus(
                        PaymentStatusEnum.SUCCESS
                );

                transaction.setFailureReason(null);

                order.setPaymentStatus(
                        PaymentStatus.COMPLETED
                );

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

                /*
                 * Only mark the Order failed when it was not already
                 * completed by another successful payment path.
                 */
                if (!PaymentStatus.COMPLETED.equals(
                        order.getPaymentStatus()
                )) {
                    order.setPaymentStatus(
                            PaymentStatus.FAILED
                    );
                }
            }

            paymentRepository.save(transaction);
            orderRepository.save(order);

            return mapToResponseDTO(transaction);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Payment reconciliation failed: "
                            + safeMessage(e)
            );
        }
    }

    @Override
    @Transactional
    public void handleRazorpayWebhook(
            String payload,
            String signature) {

        try {
            boolean isValidWebhook =
                    Utils.verifyWebhookSignature(
                            payload,
                            signature,
                            webhookSecret
                    );

            if (!isValidWebhook) {
                throw new RuntimeException(
                        "Invalid webhook signature"
                );
            }

            JSONObject jsonObj =
                    new JSONObject(payload);

            String event =
                    jsonObj.getString("event");

            if ("payment.captured".equals(event)) {

                JSONObject paymentEntity =
                        jsonObj
                                .getJSONObject("payload")
                                .getJSONObject("payment")
                                .getJSONObject("entity");

                String razorpayOrderId =
                        paymentEntity.getString("order_id");

                String razorpayPaymentId =
                        paymentEntity.getString("id");

                paymentRepository
                        .findByRazorpayOrderId(
                                razorpayOrderId
                        )
                        .ifPresent(transaction -> {

                            /*
                             * Do not downgrade a successful transaction.
                             */
                            if (transaction.getStatus()
                                    != PaymentStatusEnum.SUCCESS) {

                                transaction.setStatus(
                                        PaymentStatusEnum.SUCCESS
                                );

                                transaction.setRazorpayPaymentId(
                                        razorpayPaymentId
                                );

                                transaction.setFailureReason(null);

                                paymentRepository.save(
                                        transaction
                                );
                            }

                            Order order =
                                    transaction.getOrder();

                            if (order != null
                                    && !PaymentStatus.COMPLETED.equals(
                                            order.getPaymentStatus()
                                    )) {

                                order.setPaymentStatus(
                                        PaymentStatus.COMPLETED
                                );

                                orderRepository.save(order);
                            }
                        });
            }

        } catch (Exception e) {
            throw new RuntimeException(
                    "Webhook handling error: "
                            + safeMessage(e)
            );
        }
    }

    private void markTransactionFailed(
            PaymentTransaction transaction,
            String reason) {

        /*
         * Never downgrade SUCCESS → FAILED.
         */
        if (transaction.getStatus()
                == PaymentStatusEnum.SUCCESS) {
            return;
        }

        transaction.setStatus(
                PaymentStatusEnum.FAILED
        );

        transaction.setFailureReason(
                reason != null && !reason.isBlank()
                        ? reason
                        : "Payment processing failed"
        );

        paymentRepository.save(transaction);
    }

    private PaymentResponseDTO mapToResponseDTO(
            PaymentTransaction transaction) {

        return PaymentResponseDTO.builder()
                .transactionId(transaction.getId())
                .orderId(transaction.getOrder().getId())
                .orderNumber(
                        transaction.getOrder().getOrderNumber()
                )
                .razorpayOrderId(
                        transaction.getRazorpayOrderId()
                )
                .razorpayPaymentId(
                        transaction.getRazorpayPaymentId()
                )
                .amount(transaction.getAmountInRupees())
                .currency(transaction.getCurrency())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private String safeMessage(Exception exception) {

        String message = exception.getMessage();

        if (message == null || message.isBlank()) {
            return exception.getClass().getSimpleName();
        }

        return message;
    }
}
