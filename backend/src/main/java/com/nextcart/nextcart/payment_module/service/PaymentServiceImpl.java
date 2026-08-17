package com.nextcart.nextcart.payment_module.service;

import com.nextcart.nextcart.order_module.entity.Order;
import com.nextcart.nextcart.order_module.entity.PaymentStatus;
import com.nextcart.nextcart.order_module.repository.OrderRepository;
import com.nextcart.nextcart.payment_module.dto.*;
import com.nextcart.nextcart.payment_module.entity.*;
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

    @Override
    @Transactional
    public CreatePaymentResponseDTO createRazorpayOrder(String userEmail, CreatePaymentRequestDTO requestDto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findByIdAndUser(requestDto.getOrderId(), user)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        // Dynamically update or allow RAZORPAY as payment method
        if (!"RAZORPAY".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setPaymentMethod("RAZORPAY");
            orderRepository.save(order);
        }

        long amountInPaise = order.getTotalAmount().multiply(new BigDecimal("100")).longValue();

        try {
            RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", order.getOrderNumber());

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            String razorpayOrderId = razorpayOrder.get("id");

            PaymentTransaction transaction = PaymentTransaction.builder()
                    .user(user)
                    .order(order)
                    .razorpayOrderId(razorpayOrderId)
                    .amountInPaise(amountInPaise)
                    .amountInRupees(order.getTotalAmount())
                    .currency("INR")
                    .status(PaymentStatusEnum.CREATED)
                    .build();

            paymentRepository.save(transaction);

            return CreatePaymentResponseDTO.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .razorpayOrderId(razorpayOrderId)
                    .amount(amountInPaise)
                    .currency("INR")
                    .keyId(keyId)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Razorpay order creation failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentResponseDTO verifyPayment(String userEmail, VerifyPaymentRequestDTO requestDto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findByIdAndUser(requestDto.getOrderId(), user)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        PaymentTransaction transaction = paymentRepository.findByRazorpayOrderId(requestDto.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Transaction not found for Razorpay Order ID"));

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", requestDto.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", requestDto.getRazorpayPaymentId());
            attributes.put("razorpay_signature", requestDto.getRazorpaySignature());

            boolean isValidSignature = Utils.verifyPaymentSignature(attributes, keySecret);

            if (!isValidSignature) {
                transaction.setStatus(PaymentStatusEnum.FAILED);
                transaction.setFailureReason("Signature verification failed");
                paymentRepository.save(transaction);
                throw new RuntimeException("Payment signature verification failed");
            }

            transaction.setRazorpayPaymentId(requestDto.getRazorpayPaymentId());
            transaction.setRazorpaySignature(requestDto.getRazorpaySignature());
            transaction.setStatus(PaymentStatusEnum.SUCCESS);
            paymentRepository.save(transaction);

            // Update Order Payment Status
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            orderRepository.save(order);

            return mapToResponseDTO(transaction);

        } catch (Exception e) {
            transaction.setStatus(PaymentStatusEnum.FAILED);
            transaction.setFailureReason(e.getMessage());
            paymentRepository.save(transaction);
            throw new RuntimeException("Payment verification exception: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentStatusByOrderId(String userEmail, Long orderId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        PaymentTransaction transaction = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("No payment transaction found for this order"));

        return mapToResponseDTO(transaction);
    }

    @Override
    @Transactional
    public PaymentResponseDTO reconcilePayment(String userEmail, Long orderId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findByIdAndUser(orderId, user)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        PaymentTransaction transaction = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("No transaction found to reconcile"));

        try {
            RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);
            com.razorpay.Order razorpayOrder = razorpayClient.orders.fetch(transaction.getRazorpayOrderId());

            String razorpayStatus = razorpayOrder.get("status");

            if ("paid".equalsIgnoreCase(razorpayStatus)) {
                transaction.setStatus(PaymentStatusEnum.SUCCESS);
                order.setPaymentStatus(PaymentStatus.COMPLETED);
            } else if ("attempted".equalsIgnoreCase(razorpayStatus)) {
                transaction.setStatus(PaymentStatusEnum.CREATED);
            } else {
                transaction.setStatus(PaymentStatusEnum.FAILED);
            }

            paymentRepository.save(transaction);
            orderRepository.save(order);

            return mapToResponseDTO(transaction);

        } catch (Exception e) {
            throw new RuntimeException("Payment reconciliation failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void handleRazorpayWebhook(String payload, String signature) {
        try {
            boolean isValidWebhook = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isValidWebhook) {
                throw new RuntimeException("Invalid webhook signature");
            }

            JSONObject jsonObj = new JSONObject(payload);
            String event = jsonObj.getString("event");

            if ("payment.captured".equals(event)) {
                JSONObject paymentEntity = jsonObj.getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

                String razorpayOrderId = paymentEntity.getString("order_id");
                String razorpayPaymentId = paymentEntity.getString("id");

                paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(tx -> {
                    tx.setStatus(PaymentStatusEnum.SUCCESS);
                    tx.setRazorpayPaymentId(razorpayPaymentId);
                    paymentRepository.save(tx);

                    Order order = tx.getOrder();
                    order.setPaymentStatus(PaymentStatus.COMPLETED);
                    orderRepository.save(order);
                });
            }

        } catch (Exception e) {
            throw new RuntimeException("Webhook handling error: " + e.getMessage());
        }
    }

    private PaymentResponseDTO mapToResponseDTO(PaymentTransaction transaction) {
        return PaymentResponseDTO.builder()
                .transactionId(transaction.getId())
                .orderId(transaction.getOrder().getId())
                .orderNumber(transaction.getOrder().getOrderNumber())
                .razorpayOrderId(transaction.getRazorpayOrderId())
                .razorpayPaymentId(transaction.getRazorpayPaymentId())
                .amount(transaction.getAmountInRupees())
                .currency(transaction.getCurrency())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
