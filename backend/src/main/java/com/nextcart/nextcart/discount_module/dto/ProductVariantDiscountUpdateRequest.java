package com.nextcart.nextcart.discount_module.dto;

import com.nextcart.nextcart.discount_module.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDiscountUpdateRequest {

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(
            value = "0.01",
            message = "Discount value must be greater than zero"
    )
    private BigDecimal discountValue;

    @NotNull(message = "Start date is required")
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @NotNull(message = "Active status is required")
    private Boolean active;
}