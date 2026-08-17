package com.nextcart.nextcart.order_module.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequestDTO {

    @NotNull(message = "Shipping address ID is required")
    private Long addressId;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;
}
