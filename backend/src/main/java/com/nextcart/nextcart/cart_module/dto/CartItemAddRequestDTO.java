package com.nextcart.nextcart.cart_module.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemAddRequestDTO {

    @NotNull(message = "Product variant ID is required")
    @Min(value = 1, message = "Product variant ID must be greater than 0")
    private Long productVariantId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 99, message = "Maximum cart quantity is 99")
    private Integer quantity;
}