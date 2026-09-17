package com.nextcart.nextcart.order_module;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {

    List<OrderItemEntity> findByOrderId(Long orderId);

    Optional<OrderItemEntity> findByIdAndOrderId(
            Long itemId,
            Long orderId
    );

    boolean existsByOrderIdAndProductVariantId(
            Long orderId,
            Long productVariantId
    );

    void deleteByOrderId(Long orderId);

    // ============================
    // Seller Dashboard Queries
    // ============================

    @Query("""
            SELECT COUNT(DISTINCT oi.order.id)
            FROM OrderItemEntity oi
            WHERE oi.product.seller.id = :sellerId
            """)
    long countDistinctOrdersBySellerId(
            @Param("sellerId") Long sellerId
    );

    @Query("""
            SELECT COUNT(DISTINCT oi.order.id)
            FROM OrderItemEntity oi
            WHERE oi.product.seller.id = :sellerId
              AND oi.order.status = :status
            """)
    long countDistinctOrdersBySellerIdAndOrderStatus(
            @Param("sellerId") Long sellerId,
            @Param("status") OrderStatus status
    );

    @Query("""
            SELECT COALESCE(SUM(oi.lineTotal), 0)
            FROM OrderItemEntity oi
            WHERE oi.product.seller.id = :sellerId
            """)
    BigDecimal sumSalesBySellerId(
            @Param("sellerId") Long sellerId
    );

    @Query("""
            SELECT COALESCE(SUM(oi.lineTotal), 0)
            FROM OrderItemEntity oi
            WHERE oi.product.seller.id = :sellerId
              AND oi.order.status = :status
            """)
    BigDecimal sumSalesBySellerIdAndOrderStatus(
            @Param("sellerId") Long sellerId,
            @Param("status") OrderStatus status
    );
}