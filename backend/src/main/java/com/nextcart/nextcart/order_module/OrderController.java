package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.order_module.dto.OrderCreateRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // =========================================================
    // CUSTOMER - CREATE ORDER
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(
            Authentication authentication,
            @Valid @RequestBody OrderCreateRequestDTO request) {

        String userEmail = authentication.getName();

        OrderResponseDTO response =
                orderService.createOrder(
                        userEmail,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Order created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // CUSTOMER - GET ORDER BY ID
    // =========================================================

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(
            Authentication authentication,
            @PathVariable Long orderId) {

        String userEmail = authentication.getName();

        OrderResponseDTO response =
                orderService.getOrderById(
                        userEmail,
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // CUSTOMER - GET ORDER BY NUMBER
    // =========================================================

    @GetMapping("/number/{orderNumber}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderByNumber(
            Authentication authentication,
            @PathVariable String orderNumber) {

        String userEmail = authentication.getName();

        OrderResponseDTO response =
                orderService.getOrderByNumber(
                        userEmail,
                        orderNumber
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // CUSTOMER - MY ORDERS
    // =========================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>> getMyOrders(
            Authentication authentication,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        String userEmail = authentication.getName();

        Page<OrderResponseDTO> response =
                orderService.getMyOrders(
                        userEmail,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Orders fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // CUSTOMER - MY ORDERS BY STATUS
    // =========================================================

    @GetMapping("/my/status/{status}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>>
    getMyOrdersByStatus(
            Authentication authentication,
            @PathVariable OrderStatus status,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        String userEmail = authentication.getName();

        Page<OrderResponseDTO> response =
                orderService.getMyOrdersByStatus(
                        userEmail,
                        status,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Orders fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // CUSTOMER - CANCEL ORDER
    // =========================================================

    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> cancelOrder(
            Authentication authentication,
            @PathVariable Long orderId) {

        String userEmail = authentication.getName();

        OrderResponseDTO response =
                orderService.cancelOrder(
                        userEmail,
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order cancelled successfully",
                        response
                )
        );
    }

    // =========================================================
    // ADMIN - GET ORDER
    // =========================================================

    @GetMapping("/admin/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>>
    getOrderByIdForAdmin(
            @PathVariable Long orderId) {

        OrderResponseDTO response =
                orderService.getOrderByIdForAdmin(
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // ADMIN - GET ALL ORDERS
    // =========================================================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>>
    getAllOrdersForAdmin(
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Page<OrderResponseDTO> response =
                orderService.getAllOrdersForAdmin(
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Orders fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // ADMIN - GET ORDERS BY STATUS
    // =========================================================

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>>
    getOrdersByStatusForAdmin(
            @PathVariable OrderStatus status,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Page<OrderResponseDTO> response =
                orderService.getOrdersByStatusForAdmin(
                        status,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Orders fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // ADMIN - UPDATE ORDER STATUS
    // =========================================================

    @PatchMapping("/admin/{orderId}/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>>
    updateOrderStatus(
            @PathVariable Long orderId,
            @PathVariable OrderStatus status) {

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