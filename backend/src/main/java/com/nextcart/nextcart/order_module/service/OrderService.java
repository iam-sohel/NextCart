package com.nextcart.nextcart.order_module.service;

import com.nextcart.nextcart.order_module.dto.CheckoutRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;

import java.util.List;

public interface OrderService {
    OrderResponseDTO createOrderFromCart(String userEmail, CheckoutRequestDTO requestDto);
    List<OrderResponseDTO> getUserOrders(String userEmail);
    OrderResponseDTO getOrderById(String userEmail, Long orderId);
    OrderResponseDTO cancelOrder(String userEmail, Long orderId);
}
