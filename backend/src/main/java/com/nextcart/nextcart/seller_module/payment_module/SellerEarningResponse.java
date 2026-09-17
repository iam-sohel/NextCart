package com.nextcart.nextcart.seller_module.payment_module;

import com.nextcart.nextcart.seller_module.payment_module.SellerEarningStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerEarningResponse {

    // =========================================================
    // EARNING
    // =========================================================

    private Long id;

    // =========================================================
    // SELLER
    // =========================================================

    private Long sellerId;

    // =========================================================
    // ORDER
    // =========================================================

    private Long orderId;

    private String orderNumber;

    // =========================================================
    // ORDER ITEM
    // =========================================================

    private Long orderItemId;

    private Long productId;

    private Long productVariantId;

    private String productName;

    private String sku;

    private Integer quantity;

    // =========================================================
    // AMOUNTS
    // =========================================================

    private BigDecimal grossAmount;

    private BigDecimal commissionAmount;

    private BigDecimal netAmount;

    // =========================================================
    // STATUS
    // =========================================================

    private SellerEarningStatus status;

    // =========================================================
    // TIMESTAMPS
    // =========================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}