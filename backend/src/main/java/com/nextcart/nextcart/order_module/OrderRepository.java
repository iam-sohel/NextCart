package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.user_module.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    // =========================================================
    // ORDER LOOKUP
    // =========================================================

    Optional<OrderEntity> findByOrderNumber(String orderNumber);

    Optional<OrderEntity> findByIdAndUser(
            Long id,
            User user
    );

    boolean existsByOrderNumber(String orderNumber);


    // =========================================================
    // USER ORDERS
    // =========================================================

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


    // =========================================================
    // PAYMENT EXPIRY
    // =========================================================
    //
    // Finds orders whose payment window has expired.
    //
    // IMPORTANT:
    // Only PENDING orders are considered.
    //
    // An order that is already CONFIRMED must never be
    // cancelled by the expiry scheduler.
    // =========================================================

    List<OrderEntity> findByStatusAndPaymentExpiresAtBefore(
            OrderStatus status,
            LocalDateTime time
    );


    // =========================================================
    // PESSIMISTIC LOCK - ORDER ID
    // =========================================================
    //
    // Used when:
    // - cancelling an order
    // - verifying payment
    // - expiring an order
    // - changing critical order state
    //
    // Prevents two concurrent transactions from modifying
    // the same order at the same time.
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