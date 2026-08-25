package com.nextcart.nextcart.order_module.repository;

import com.nextcart.nextcart.order_module.entity.Order;
import com.nextcart.nextcart.user_module.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    Optional<Order> findByIdAndUser(
            Long id,
            User user
    );

    Optional<Order> findByOrderNumberAndUser(
            String orderNumber,
            User user
    );
}