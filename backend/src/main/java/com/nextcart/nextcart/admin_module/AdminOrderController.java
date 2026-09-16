package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.order_module.OrderService;
import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    // =========================================================
    // GET ALL ORDERS / FILTER BY STATUS
    // =========================================================

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Page<OrderResponseDTO> response;

        if (status != null) {
            response = orderService.getOrdersByStatusForAdmin(
                    status,
                    pageable
            );
        } else {
            response = orderService.getAllOrdersForAdmin(
                    pageable
            );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Orders fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(
            @PathVariable Long orderId) {

        OrderResponseDTO response =
                orderService.getOrderByIdForAdmin(orderId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {

        OrderResponseDTO response =
                orderService.updateOrderStatus(
                        orderId,
                        status
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order status updated successfully",
                        response
                )
        );
    }
}