package com.nextcart.nextcart.product_module.discount.dto;

import com.nextcart.nextcart.product_module.discount.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDiscountResponse {

    private Long id;

    private Long productVariantId;

    private DiscountType discountType;

    private BigDecimal discountValue;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private boolean active;
}