package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.user_module.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface OrderRepository
        extends JpaRepository<OrderEntity, Long> {

    Optional<OrderEntity> findByOrderNumber(
            String orderNumber
    );

    Optional<OrderEntity> findByIdAndUser(
            Long id,
            User user
    );

    Page<OrderEntity> findByUser(
            User user,
            Pageable pageable
    );

    Page<OrderEntity> findByUserAndStatus(
            User user,
            OrderStatus status,
            Pageable pageable
    );

    // =========================================================
    // ADMIN - GET ORDERS BY STATUS
    // =========================================================

    Page<OrderEntity> findByStatus(
            OrderStatus status,
            Pageable pageable
    );

    boolean existsByOrderNumber(
            String orderNumber
    );

    // =========================================================
    // PESSIMISTIC LOCK - ORDER ID
    // =========================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT o
            FROM OrderEntity o
            WHERE o.id = :id
            """)
    Optional<OrderEntity> findByIdForUpdate(
            @Param("id") Long id
    );

    // =========================================================
    // PESSIMISTIC LOCK - ORDER NUMBER
    // =========================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT o
            FROM OrderEntity o
            WHERE o.orderNumber = :orderNumber
            """)
    Optional<OrderEntity> findByOrderNumberForUpdate(
            @Param("orderNumber") String orderNumber
    );
}