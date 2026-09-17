package com.nextcart.nextcart.seller_module.order_module;

import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SellerOrderService {

    // =========================================================
    // SELLER - GET ALL ORDERS
    // =========================================================

    Page<OrderResponseDTO> getMyOrders(
            Long sellerId,
            Pageable pageable
    );


    // =========================================================
    // SELLER - GET ORDER BY ID
    // =========================================================

    OrderResponseDTO getMyOrderById(
            Long sellerId,
            Long orderId
    );


    // =========================================================
    // SELLER - GET ORDERS BY STATUS
    // =========================================================

    Page<OrderResponseDTO> getMyOrdersByStatus(
            Long sellerId,
            OrderStatus status,
            Pageable pageable
    );
}