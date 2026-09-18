package com.nextcart.nextcart.seller_module.seller_coupon;

import com.nextcart.nextcart.discount_module.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerCouponResponse {

    private Long id;

    private Long sellerId;

    private String code;

    private DiscountType discountType;

    private BigDecimal discountValue;

    private BigDecimal minimumOrderAmount;

    private BigDecimal maximumDiscountAmount;

    private Integer usageLimit;

    private Integer usedCount;

    private Integer perCustomerLimit;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}