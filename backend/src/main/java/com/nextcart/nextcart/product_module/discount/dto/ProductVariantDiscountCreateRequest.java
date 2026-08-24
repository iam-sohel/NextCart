package com.nextcart.nextcart.product_module.discount.dto;

import com.nextcart.nextcart.product_module.discount.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDiscountCreateRequest {

    @NotNull(message = "Product variant id is required")
    private Long productVariantId;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(
            value = "0.01",
            message = "Discount value must be greater than zero"
    )
    private BigDecimal discountValue;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(
            message = "Start date must be current or future"
    )
    private LocalDateTime startAt;

    private LocalDateTime endAt;
}