package com.nextcart.nextcart.payment_module.dto;

import lombok.*;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentResponseDTO {
    private Long orderId;
    private String orderNumber;
    private String razorpayOrderId;
    private Long amount;
    private String currency;
    private String keyId;
}
