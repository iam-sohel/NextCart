package com.nextcart.nextcart.seller_module.seller_coupon;

import com.nextcart.nextcart.discount_module.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SellerCouponUpdateRequest(

        @Size(max = 50, message = "Coupon code must not exceed 50 characters")
        String code,

        @NotNull(message = "Discount type is required")
        DiscountType discountType,

        @NotNull(message = "Discount value is required")
        @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
        BigDecimal discountValue,

        @DecimalMin(
                value = "0.00",
                message = "Minimum order amount cannot be negative"
        )
        BigDecimal minimumOrderAmount,

        @DecimalMin(
                value = "0.00",
                message = "Maximum discount cannot be negative"
        )
        BigDecimal maximumDiscountAmount,

        @Min(value = 1, message = "Usage limit must be at least 1")
        Integer usageLimit,

        @Min(value = 1, message = "Per customer limit must be at least 1")
        Integer perCustomerLimit,

        @NotNull(message = "Start date is required")
        LocalDateTime startAt,

        LocalDateTime endAt
) {
}