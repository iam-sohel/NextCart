package com.nextcart.nextcart.seller_module.analytics.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerAnalyticsResponse {

    private Long sellerId;
    private LocalDate from;
    private LocalDate to;

    private Overview overview;
    private OrderAnalytics orders;
    private ProductAnalytics products;
    private InventoryAnalytics inventory;
    private List<DailySales> dailySales;
    private List<TopProduct> topProducts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Overview {
        private BigDecimal totalSales;
        private long totalOrders;
        private long totalUnitsSold;
        private BigDecimal averageOrderValue;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderAnalytics {
        private Map<String, Long> statusCounts;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductAnalytics {
        private long totalProducts;
        private long activeProducts;
        private long inactiveProducts;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryAnalytics {
        private long totalItems;
        private long availableStock;
        private long reservedStock;
        private long lowStockItems;
        private long outOfStockItems;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailySales {
        private LocalDate date;
        private BigDecimal sales;
        private long unitsSold;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProduct {
        private Long productId;
        private String productName;
        private long unitsSold;
        private BigDecimal sales;
    }
}
