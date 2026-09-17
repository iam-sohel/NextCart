package com.nextcart.nextcart.seller_module.order_module;

import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.order_module.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SellerOrderRepository extends JpaRepository<OrderEntity, Long> {

    // =========================================================
    // SELLER - GET ALL ORDERS
    // =========================================================
    //
    // Finds orders containing at least one product owned
    // by the given seller.
    //
    // DISTINCT is required because one order can contain
    // multiple products belonging to the same seller.
    // =========================================================

    @Query("""
            SELECT DISTINCT o
            FROM OrderEntity o
            JOIN o.items oi
            JOIN oi.product p
            WHERE p.seller.id = :sellerId
            """)
    Page<OrderEntity> findOrdersBySellerId(
            @Param("sellerId") Long sellerId,
            Pageable pageable
    );


    // =========================================================
    // SELLER - GET ORDER BY ID
    // =========================================================
    //
    // Returns the order only when it contains at least one
    // product owned by the given seller.
    // =========================================================

    @Query("""
            SELECT DISTINCT o
            FROM OrderEntity o
            JOIN o.items oi
            JOIN oi.product p
            WHERE o.id = :orderId
              AND p.seller.id = :sellerId
            """)
    Optional<OrderEntity> findOrderByIdAndSellerId(
            @Param("orderId") Long orderId,
            @Param("sellerId") Long sellerId
    );


    // =========================================================
    // SELLER - GET ORDERS BY STATUS
    // =========================================================

    @Query("""
            SELECT DISTINCT o
            FROM OrderEntity o
            JOIN o.items oi
            JOIN oi.product p
            WHERE p.seller.id = :sellerId
              AND o.status = :status
            """)
    Page<OrderEntity> findOrdersBySellerIdAndStatus(
            @Param("sellerId") Long sellerId,
            @Param("status") OrderStatus status,
            Pageable pageable
    );
}