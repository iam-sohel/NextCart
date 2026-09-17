package com.nextcart.nextcart.seller_module.dashboard.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerDashboardResponse {

    private SellerSummary seller;
    private ProductSummary products;
    private OrderSummary orders;
    private InventorySummary inventory;
    private SalesSummary sales;
    private WarehouseSummary warehouses;
    private VerificationSummary verification;
    private LocalDateTime generatedAt;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerSummary {
        private Long sellerId;
        private String businessName;
        private boolean verified;
        private boolean active;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSummary {
        private long total;
        private long active;
        private long inactive;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummary {
        private long total;
        private long pending;
        private long confirmed;
        private long processing;
        private long shipped;
        private long delivered;
        private long cancelled;
        private long returnRequested;
        private long returnApproved;
        private long returned;
        private long refunded;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventorySummary {
        private long totalItems;
        private long lowStockItems;
        private long outOfStockItems;
        private long availableStock;
        private long reservedStock;
        private int lowStockThreshold;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesSummary {
        private BigDecimal totalSalesAmount;
        private BigDecimal deliveredSalesAmount;
        private BigDecimal refundedSalesAmount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseSummary {
        private long total;
        private long active;
        private long inactive;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerificationSummary {
        private String kycStatus;
        private String bankStatus;
    }
}
