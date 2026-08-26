package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.order_module.dto.OrderCreateRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderResponseDTO createOrder(
            String userEmail,
            OrderCreateRequestDTO request
    );

    OrderResponseDTO getOrderById(
            String userEmail,
            Long orderId
    );

    OrderResponseDTO getOrderByNumber(
            String userEmail,
            String orderNumber
    );

    Page<OrderResponseDTO> getMyOrders(
            String userEmail,
            Pageable pageable
    );

    Page<OrderResponseDTO> getMyOrdersByStatus(
            String userEmail,
            OrderStatus status,
            Pageable pageable
    );

    OrderResponseDTO cancelOrder(
            String userEmail,
            Long orderId
    );

    OrderResponseDTO getOrderByIdForAdmin(
            Long orderId
    );

    Page<OrderResponseDTO> getAllOrdersForAdmin(
            Pageable pageable
    );

    Page<OrderResponseDTO> getOrdersByStatusForAdmin(
            OrderStatus status,
            Pageable pageable
    );

    OrderResponseDTO updateOrderStatus(
            Long orderId,
            OrderStatus status
    );
}