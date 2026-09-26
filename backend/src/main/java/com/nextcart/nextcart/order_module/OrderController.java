package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.order_module.dto.OrderCreateRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import com.nextcart.nextcart.order_module.exceptions.OrderValidationException;
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
    public ResponseEntity<CommonResponseDto<OrderResponseDTO>> createOrder(
            Authentication authentication,
            @Valid @RequestBody OrderCreateRequestDTO request) {

        String userIdentifier =
                getAuthenticatedUserIdentifier(authentication);

        OrderResponseDTO response =
                orderService.createOrder(
                        userIdentifier,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<OrderResponseDTO>> getOrderById(
            Authentication authentication,
            @PathVariable Long orderId) {

        String userIdentifier =
                getAuthenticatedUserIdentifier(authentication);

        OrderResponseDTO response =
                orderService.getOrderById(
                        userIdentifier,
                        orderId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<OrderResponseDTO>>
    getOrderByNumber(
            Authentication authentication,
            @PathVariable String orderNumber) {

        String userIdentifier =
                getAuthenticatedUserIdentifier(authentication);

        OrderResponseDTO response =
                orderService.getOrderByNumber(
                        userIdentifier,
                        orderNumber
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<Page<OrderResponseDTO>>>
    getMyOrders(
            Authentication authentication,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        String userIdentifier =
                getAuthenticatedUserIdentifier(authentication);

        Page<OrderResponseDTO> response =
                orderService.getMyOrders(
                        userIdentifier,
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<Page<OrderResponseDTO>>>
    getMyOrdersByStatus(
            Authentication authentication,
            @PathVariable OrderStatus status,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        String userIdentifier =
                getAuthenticatedUserIdentifier(authentication);

        Page<OrderResponseDTO> response =
                orderService.getMyOrdersByStatus(
                        userIdentifier,
                        status,
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<OrderResponseDTO>>
    cancelOrder(
            Authentication authentication,
            @PathVariable Long orderId) {

        String userIdentifier =
                getAuthenticatedUserIdentifier(authentication);

        OrderResponseDTO response =
                orderService.cancelOrder(
                        userIdentifier,
                        orderId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<OrderResponseDTO>>
    getOrderByIdForAdmin(
            @PathVariable Long orderId) {

        OrderResponseDTO response =
                orderService.getOrderByIdForAdmin(
                        orderId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<Page<OrderResponseDTO>>>
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
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<Page<OrderResponseDTO>>>
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
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<OrderResponseDTO>>
    updateOrderStatus(
            @PathVariable Long orderId,
            @PathVariable OrderStatus status) {

        OrderResponseDTO response =
                orderService.updateOrderStatus(
                        orderId,
                        status
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Order status updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // AUTHENTICATED USER IDENTIFIER
    // =========================================================

    private String getAuthenticatedUserIdentifier(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new OrderValidationException(
                    "Authenticated user is required"
            );
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            if (userDetails.getUser() == null ||
                    userDetails.getUser().getId() == null ||
                    userDetails.getUser().getId() <= 0) {

                throw new OrderValidationException(
                        "Authenticated user ID is required"
                );
            }

            return String.valueOf(
                    userDetails.getUser().getId()
            );
        }

        String name = authentication.getName();

        if (name == null || name.isBlank()) {

            throw new OrderValidationException(
                    "Authenticated user is required"
            );
        }

        return name.trim();
    }
}