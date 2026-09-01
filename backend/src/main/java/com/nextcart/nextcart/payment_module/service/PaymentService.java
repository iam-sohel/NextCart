package com.nextcart.nextcart.payment_module.service;


import com.nextcart.nextcart.payment_module.dto.CreatePaymentRequestDTO;
import com.nextcart.nextcart.payment_module.dto.CreatePaymentResponseDTO;
import com.nextcart.nextcart.payment_module.dto.PaymentResponseDTO;
import com.nextcart.nextcart.payment_module.dto.VerifyPaymentRequestDTO;

public interface PaymentService {

    CreatePaymentResponseDTO createRazorpayOrder(
            String userEmail,
            CreatePaymentRequestDTO requestDto
    );

    PaymentResponseDTO verifyPayment(
            String userEmail,
            VerifyPaymentRequestDTO requestDto
    );

    PaymentResponseDTO getPaymentStatusByOrderId(
            String userEmail,
            Long orderId
    );

    PaymentResponseDTO reconcilePayment(
            String userEmail,
            Long orderId
    );

    PaymentResponseDTO refundPayment(
            String userEmail,
            Long orderId
    );

    void handleRazorpayWebhook(
            String payload,
            String signature
    );
}
