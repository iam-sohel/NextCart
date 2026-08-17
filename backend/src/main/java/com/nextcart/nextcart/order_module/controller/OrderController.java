package com.nextcart.nextcart.order_module.controller;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.order_module.dto.CheckoutRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import com.nextcart.nextcart.order_module.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "APIs for handling Checkout and User Orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Checkout cart and create a new order")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequestDTO requestDto) {

        OrderResponseDTO response = orderService.createOrderFromCart(authentication.getName(), requestDto);
        return new ResponseEntity<>(
                new ApiResponse<>(true, "Order placed successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @Operation(summary = "Get all orders for the logged-in user")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getUserOrders(
            Authentication authentication) {

        List<OrderResponseDTO> response = orderService.getUserOrders(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(
            Authentication authentication,
            @PathVariable("id") Long orderId) {

        OrderResponseDTO response = orderService.getOrderById(authentication.getName(), orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order details retrieved successfully", response));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> cancelOrder(
            Authentication authentication,
            @PathVariable("id") Long orderId) {

        OrderResponseDTO response = orderService.cancelOrder(authentication.getName(), orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order cancelled successfully", response));
    }
}
