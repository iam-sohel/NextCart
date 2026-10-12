package com.gesmio.havlook.payment_module.service;


import com.gesmio.havlook.payment_module.dto.CreatePaymentRequestDTO;
import com.gesmio.havlook.payment_module.dto.CreatePaymentResponseDTO;
import com.gesmio.havlook.payment_module.dto.PaymentResponseDTO;
import com.gesmio.havlook.payment_module.dto.VerifyPaymentRequestDTO;

public interface PaymentService {

    CreatePaymentResponseDTO createRazorpayOrder(
            String userId,
            CreatePaymentRequestDTO requestDto
    );

    PaymentResponseDTO verifyPayment(
            String userId,
            VerifyPaymentRequestDTO requestDto
    );

    PaymentResponseDTO getPaymentStatusByOrderId(
            String userId,
            Long orderId
    );

    PaymentResponseDTO reconcilePayment(
            String userId,
            Long orderId
    );

    PaymentResponseDTO refundPayment(
            String userId,
            Long orderId
    );

    void handleRazorpayWebhook(
            String payload,
            String signature
    );
}
