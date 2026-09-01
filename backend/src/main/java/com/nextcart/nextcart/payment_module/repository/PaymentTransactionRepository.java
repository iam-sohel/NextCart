package com.nextcart.nextcart.payment_module.repository;

import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.payment_module.entity.PaymentTransaction;
import com.nextcart.nextcart.user_module.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, Long> {

    // =========================================================
    // RAZORPAY ORDER
    // =========================================================

    Optional<PaymentTransaction> findByRazorpayOrderId(
            String razorpayOrderId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p
            FROM PaymentTransaction p
            WHERE p.razorpayOrderId = :razorpayOrderId
            """)
    Optional<PaymentTransaction> findByRazorpayOrderIdForUpdate(
            @Param("razorpayOrderId")
            String razorpayOrderId
    );


    // =========================================================
    // RAZORPAY PAYMENT
    // =========================================================

    Optional<PaymentTransaction> findByRazorpayPaymentId(
            String razorpayPaymentId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p
            FROM PaymentTransaction p
            WHERE p.razorpayPaymentId = :razorpayPaymentId
            """)
    Optional<PaymentTransaction> findByRazorpayPaymentIdForUpdate(
            @Param("razorpayPaymentId")
            String razorpayPaymentId
    );


    // =========================================================
    // ORDER
    // =========================================================

    Optional<PaymentTransaction> findByOrder(
            OrderEntity order
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p
            FROM PaymentTransaction p
            WHERE p.order = :order
            """)
    Optional<PaymentTransaction> findByOrderForUpdate(
            @Param("order")
            OrderEntity order
    );


    // =========================================================
    // ORDER + USER
    // =========================================================

    Optional<PaymentTransaction> findByOrderAndUser(
            OrderEntity order,
            User user
    );
}