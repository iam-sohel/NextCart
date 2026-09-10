package com.nextcart.nextcart.order_module.dto;

import com.nextcart.nextcart.order_module.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequestDTO {

    @NotNull(message = "Address ID is required")
    @Positive(message = "Address ID must be greater than zero")
    private Long addressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}