package com.nextcart.nextcart.payment_module.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequestDTO {

    @NotNull(message = "Order ID is required")
    private Long orderId;
}
