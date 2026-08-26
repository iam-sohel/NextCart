package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.order_module.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository
        extends JpaRepository<OrderItemEntity, Long> {

    List<OrderItemEntity> findByOrderId(
            Long orderId
    );

    Optional<OrderItemEntity> findByIdAndOrderId(
            Long itemId,
            Long orderId
    );

    boolean existsByOrderIdAndProductVariantId(
            Long orderId,
            Long productVariantId
    );

    void deleteByOrderId(
            Long orderId
    );
}