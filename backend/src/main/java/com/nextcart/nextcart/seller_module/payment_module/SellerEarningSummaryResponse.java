package com.nextcart.nextcart.seller_module.payment_module;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerEarningSummaryResponse {

    // =========================================================
    // SELLER
    // =========================================================

    private Long sellerId;

    // =========================================================
    // TOTAL EARNINGS
    // =========================================================

    /**
     * Total gross amount generated from seller's orders.
     */
    private BigDecimal totalGrossAmount;

    /**
     * Total platform commission deducted.
     */
    private BigDecimal totalCommissionAmount;

    /**
     * Total net earnings.
     */
    private BigDecimal totalNetAmount;

    // =========================================================
    // PENDING
    // =========================================================

    /**
     * Earnings that are not yet available for payout.
     */
    private BigDecimal pendingAmount;

    // =========================================================
    // AVAILABLE
    // =========================================================

    /**
     * Earnings currently available for payout.
     */
    private BigDecimal availableAmount;

    // =========================================================
    // PAID
    // =========================================================

    /**
     * Amount already paid to the seller.
     */
    private BigDecimal paidAmount;

    // =========================================================
    // REFUNDED
    // =========================================================

    /**
     * Amount associated with refunded orders/items.
     */
    private BigDecimal refundedAmount;

    // =========================================================
    // COUNTS
    // =========================================================

    private long totalEarningRecords;

    private long pendingRecords;

    private long availableRecords;

    private long paidRecords;

    private long refundedRecords;
}