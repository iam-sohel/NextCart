package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.order_module.dto.OrderCreateRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import com.nextcart.nextcart.order_module.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(
            @RequestAttribute("userEmail") String userEmail,
            @Valid @RequestBody OrderCreateRequestDTO request
    ) {

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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(
            @RequestAttribute("userEmail") String userEmail,
            @PathVariable Long orderId
    ) {

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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderByNumber(
            @RequestAttribute("userEmail") String userEmail,
            @PathVariable String orderNumber
    ) {

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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>> getMyOrders(
            @RequestAttribute("userEmail") String userEmail,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>>
    getMyOrdersByStatus(
            @RequestAttribute("userEmail") String userEmail,
            @PathVariable OrderStatus status,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

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
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> cancelOrder(
            @RequestAttribute("userEmail") String userEmail,
            @PathVariable Long orderId
    ) {

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
            @PathVariable Long orderId
    ) {

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
            Pageable pageable
    ) {

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
            Pageable pageable
    ) {

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
            @PathVariable OrderStatus status
    ) {

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