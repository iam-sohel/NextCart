package com.nextcart.nextcart.payment_module.repository;

import com.nextcart.nextcart.order_module.entity.Order;
import com.nextcart.nextcart.payment_module.entity.PaymentTransaction;
import com.nextcart.nextcart.user_module.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByRazorpayOrderId(String razorpayOrderId);
    Optional<PaymentTransaction> findByOrderAndUser(Order order, User user);
    Optional<PaymentTransaction> findByOrder(Order order);
}
