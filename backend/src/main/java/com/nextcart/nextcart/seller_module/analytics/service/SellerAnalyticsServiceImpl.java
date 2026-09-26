package com.nextcart.nextcart.seller_module.analytics.service;

import com.nextcart.nextcart.order_module.OrderItemEntity;
import com.nextcart.nextcart.order_module.OrderItemRepository;
import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.product_module.product_base.entity.ProductEntity;
import com.nextcart.nextcart.product_module.product_base.entity.ProductStatus;
import com.nextcart.nextcart.product_module.product_base.repository.ProductRepository;
import com.nextcart.nextcart.seller_module.analytics.dto.SellerAnalyticsResponse;
import com.nextcart.nextcart.seller_module.inventory_module.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerAnalyticsServiceImpl implements SellerAnalyticsService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;

    @Override
    public SellerAnalyticsResponse getAnalytics(
            Long sellerId,
            LocalDate from,
            LocalDate to
    ) {

        if (sellerId == null) {
            throw new IllegalArgumentException("Seller ID is required");
        }

        LocalDate effectiveFrom =
                from != null
                        ? from
                        : LocalDate.now().withDayOfMonth(1);

        LocalDate effectiveTo =
                to != null
                        ? to
                        : LocalDate.now();

        if (effectiveFrom.isAfter(effectiveTo)) {
            throw new IllegalArgumentException(
                    "From date cannot be after To date"
            );
        }

        /*
         * Existing OrderItemRepository is used.
         * Do NOT create another OrderItemRepository inside analytics package.
         */
        List<OrderItemEntity> orderItems =
                orderItemRepository.findAll()
                        .stream()
                        .filter(item -> isSellerOrderItem(item, sellerId))
                        .filter(item -> item.getOrder() != null)
                        .filter(item -> item.getOrder().getCreatedAt() != null)
                        .filter(item -> isWithinDateRange(
                                item.getOrder()
                                        .getCreatedAt()
                                        .toLocalDate(),
                                effectiveFrom,
                                effectiveTo
                        ))
                        .toList();

        /*
         * Sales are considered only for delivered orders.
         */
        List<OrderItemEntity> deliveredItems =
                orderItems.stream()
                        .filter(item ->
                                item.getOrder().getStatus()
                                        == OrderStatus.DELIVERED)
                        .toList();

        SellerAnalyticsResponse.Overview overview =
                buildOverview(deliveredItems);

        SellerAnalyticsResponse.OrderAnalytics orders =
                buildOrderAnalytics(orderItems);

        SellerAnalyticsResponse.ProductAnalytics products =
                buildProductAnalytics(sellerId);

        SellerAnalyticsResponse.InventoryAnalytics inventory =
                buildInventoryAnalytics(sellerId);

        List<SellerAnalyticsResponse.DailySales> dailySales =
                buildDailySales(deliveredItems);

        List<SellerAnalyticsResponse.TopProduct> topProducts =
                buildTopProducts(deliveredItems);

        return SellerAnalyticsResponse.builder()
                .sellerId(sellerId)
                .from(effectiveFrom)
                .to(effectiveTo)
                .overview(overview)
                .orders(orders)
                .products(products)
                .inventory(inventory)
                .dailySales(dailySales)
                .topProducts(topProducts)
                .build();
    }

    private SellerAnalyticsResponse.Overview buildOverview(
            List<OrderItemEntity> deliveredItems
    ) {

        BigDecimal totalSales =
                deliveredItems.stream()
                        .map(OrderItemEntity::getLineTotal)
                        .filter(Objects::nonNull)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        long totalUnitsSold =
                deliveredItems.stream()
                        .mapToLong(item ->
                                item.getQuantity() != null
                                        ? item.getQuantity()
                                        : 0L
                        )
                        .sum();

        long totalOrders =
                deliveredItems.stream()
                        .map(item -> item.getOrder().getId())
                        .filter(Objects::nonNull)
                        .distinct()
                        .count();

        BigDecimal averageOrderValue =
                totalOrders > 0
                        ? totalSales.divide(
                                BigDecimal.valueOf(totalOrders),
                                2,
                                RoundingMode.HALF_UP
                        )
                        : BigDecimal.ZERO;

        return SellerAnalyticsResponse.Overview.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .totalUnitsSold(totalUnitsSold)
                .averageOrderValue(averageOrderValue)
                .build();
    }

    private SellerAnalyticsResponse.OrderAnalytics buildOrderAnalytics(
            List<OrderItemEntity> orderItems
    ) {

        Map<String, Long> statusCounts =
                orderItems.stream()
                        .filter(item -> item.getOrder() != null)
                        .filter(item -> item.getOrder().getStatus() != null)
                        .collect(Collectors.groupingBy(
                                item -> item.getOrder()
                                        .getStatus()
                                        .name(),
                                Collectors.mapping(
                                        item -> item.getOrder().getId(),
                                        Collectors.filtering(
                                                Objects::nonNull,
                                                Collectors.collectingAndThen(
                                                        Collectors.toSet(),
                                                        set -> 1L
                                                )
                                        )
                                )
                        ));

        /*
         * The above grouping is difficult to maintain for distinct order
         * counting, so build it directly.
         */
        Map<String, Long> distinctStatusCounts =
                orderItems.stream()
                        .filter(item -> item.getOrder() != null)
                        .filter(item -> item.getOrder().getStatus() != null)
                        .collect(Collectors.groupingBy(
                                item -> item.getOrder()
                                        .getStatus()
                                        .name(),
                                Collectors.collectingAndThen(
                                        Collectors.mapping(
                                                item -> item.getOrder().getId(),
                                                Collectors.toSet()
                                        ),
                                        set -> (long) set.size()
                                )
                        ));

        return SellerAnalyticsResponse.OrderAnalytics.builder()
                .statusCounts(distinctStatusCounts)
                .build();
    }

    private SellerAnalyticsResponse.ProductAnalytics buildProductAnalytics(
            Long sellerId
    ) {

        long totalProducts =
                productRepository.countBySellerId(sellerId);

        long activeProducts =
                productRepository.countBySellerIdAndStatus(
                        sellerId,
                        ProductStatus.ACTIVE
                );

        long inactiveProducts =
                Math.max(0L, totalProducts - activeProducts);

        return SellerAnalyticsResponse.ProductAnalytics.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .inactiveProducts(inactiveProducts)
                .build();
    }

    private SellerAnalyticsResponse.InventoryAnalytics buildInventoryAnalytics(
            Long sellerId
    ) {

        long totalItems =
                inventoryItemRepository.countBySellerId(sellerId);

        long availableStock =
                inventoryItemRepository
                        .sumAvailableStockBySellerId(sellerId);

        long reservedStock =
                inventoryItemRepository
                        .sumReservedStockBySellerId(sellerId);

        long lowStockItems =
                inventoryItemRepository
                        .countBySellerIdAndAvailableStockLessThanEqual(
                                sellerId,
                                LOW_STOCK_THRESHOLD
                        );

        long outOfStockItems =
                inventoryItemRepository
                        .countBySellerIdAndAvailableStockLessThanEqual(
                                sellerId,
                                0
                        );

        return SellerAnalyticsResponse.InventoryAnalytics.builder()
                .totalItems(totalItems)
                .availableStock(availableStock)
                .reservedStock(reservedStock)
                .lowStockItems(lowStockItems)
                .outOfStockItems(outOfStockItems)
                .build();
    }

    private List<SellerAnalyticsResponse.DailySales> buildDailySales(
            List<OrderItemEntity> deliveredItems
    ) {

        return deliveredItems.stream()
                .filter(item -> item.getOrder() != null)
                .filter(item -> item.getOrder().getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        item -> item.getOrder()
                                .getCreatedAt()
                                .toLocalDate()
                ))
                .entrySet()
                .stream()
                .map(entry -> {

                    BigDecimal sales =
                            entry.getValue()
                                    .stream()
                                    .map(OrderItemEntity::getLineTotal)
                                    .filter(Objects::nonNull)
                                    .reduce(
                                            BigDecimal.ZERO,
                                            BigDecimal::add
                                    );

                    long unitsSold =
                            entry.getValue()
                                    .stream()
                                    .mapToLong(item ->
                                            item.getQuantity() != null
                                                    ? item.getQuantity()
                                                    : 0L
                                    )
                                    .sum();

                    return SellerAnalyticsResponse.DailySales.builder()
                            .date(entry.getKey())
                            .sales(sales)
                            .unitsSold(unitsSold)
                            .build();
                })
                .sorted(
                        Comparator.comparing(
                                SellerAnalyticsResponse.DailySales::getDate
                        )
                )
                .toList();
    }

    private List<SellerAnalyticsResponse.TopProduct> buildTopProducts(
            List<OrderItemEntity> deliveredItems
    ) {

        return deliveredItems.stream()
                .filter(item -> item.getProduct() != null)
                .filter(item -> item.getProduct().getId() != null)
                .collect(Collectors.groupingBy(
                        item -> item.getProduct().getId()
                ))
                .entrySet()
                .stream()
                .map(entry -> {

                    List<OrderItemEntity> items =
                            entry.getValue();

                    ProductEntity product =
                            items.get(0).getProduct();

                    long unitsSold =
                            items.stream()
                                    .mapToLong(item ->
                                            item.getQuantity() != null
                                                    ? item.getQuantity()
                                                    : 0L
                                    )
                                    .sum();

                    BigDecimal sales =
                            items.stream()
                                    .map(OrderItemEntity::getLineTotal)
                                    .filter(Objects::nonNull)
                                    .reduce(
                                            BigDecimal.ZERO,
                                            BigDecimal::add
                                    );

                    return SellerAnalyticsResponse.TopProduct.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .unitsSold(unitsSold)
                            .sales(sales)
                            .build();
                })
                .sorted(
                        Comparator.comparing(
                                SellerAnalyticsResponse.TopProduct::getUnitsSold
                        ).reversed()
                )
                .limit(10)
                .toList();
    }

    private boolean isSellerOrderItem(
            OrderItemEntity item,
            Long sellerId
    ) {

        return item != null
                && item.getProduct() != null
                && item.getProduct().getSeller() != null
                && item.getProduct().getSeller().getId() != null
                && item.getProduct()
                        .getSeller()
                        .getId()
                        .equals(sellerId);
    }

    private boolean isWithinDateRange(
            LocalDate date,
            LocalDate from,
            LocalDate to
    ) {

        return !date.isBefore(from)
                && !date.isAfter(to);
    }
}