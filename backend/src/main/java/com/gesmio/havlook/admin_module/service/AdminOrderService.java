package com.gesmio.havlook.admin_module.service;

import com.gesmio.havlook.order_module.OrderStatus;
import com.gesmio.havlook.order_module.dto.OrderResponseDTO;
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