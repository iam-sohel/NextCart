package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.order_module.dto.OrderCreateRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    // =========================================================
    // CUSTOMER - CREATE ORDER
    // =========================================================

    OrderResponseDTO createOrder(
            String userEmail,
            OrderCreateRequestDTO request
    );


    // =========================================================
    // CUSTOMER - GET ORDER
    // =========================================================

    OrderResponseDTO getOrderById(
            String userEmail,
            Long orderId
    );

    OrderResponseDTO getOrderByNumber(
            String userEmail,
            String orderNumber
    );


    // =========================================================
    // CUSTOMER - MY ORDERS
    // =========================================================

    Page<OrderResponseDTO> getMyOrders(
            String userEmail,
            Pageable pageable
    );

    Page<OrderResponseDTO> getMyOrdersByStatus(
            String userEmail,
            OrderStatus status,
            Pageable pageable
    );


    // =========================================================
    // CUSTOMER - CANCEL ORDER
    // =========================================================

    OrderResponseDTO cancelOrder(
            String userEmail,
            Long orderId
    );


    // =========================================================
    // ADMIN - GET ORDERS
    // =========================================================

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


    // =========================================================
    // ADMIN - UPDATE ORDER STATUS
    // =========================================================

    OrderResponseDTO updateOrderStatus(
            Long orderId,
            OrderStatus status
    );


    // =========================================================
    // SYSTEM - EXPIRE UNPAID ORDERS
    // =========================================================
    //
    // Finds PENDING orders whose payment window has expired.
    //
    // For each order:
    //
    // PENDING
    //    ↓
    // CANCELLED
    //    ↓
    // Release reserved inventory
    //
    // This method will be called by the scheduled expiry job.
    // =========================================================

    void expirePendingOrders();
}