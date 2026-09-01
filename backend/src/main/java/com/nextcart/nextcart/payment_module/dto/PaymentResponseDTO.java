package com.nextcart.nextcart.payment_module.dto;

import com.nextcart.nextcart.payment_module.entity.PaymentStatusEnum;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {

    private Long transactionId;

    private Long orderId;

    private String orderNumber;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpayRefundId;

    private BigDecimal amount;

    private BigDecimal refundedAmount;

    private String currency;

    private PaymentStatusEnum status;

    private LocalDateTime createdAt;
}