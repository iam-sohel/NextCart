package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminOrderService {

    Page<OrderResponseDTO> getAllOrders(Pageable pageable);

    Page<OrderResponseDTO> getOrdersByStatus(
            OrderStatus status,
            Pageable pageable
    );

    OrderResponseDTO getOrderById(Long orderId);

    OrderResponseDTO updateOrderStatus(
            Long orderId,
            OrderStatus status
    );
}