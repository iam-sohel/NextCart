package com.nextcart.nextcart.seller_module.order_module.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.order_module.service.SellerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sellers/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerOrderController {

    private final SellerOrderService sellerOrderService;
    private final SellerRepository sellerRepository;


    // =========================================================
    // SELLER - GET MY ORDERS
    // =========================================================

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>> getMyOrders(
            Authentication authentication,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        Page<OrderResponseDTO> response =
                sellerOrderService.getMyOrders(
                        sellerId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller orders fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // SELLER - GET ORDER BY ID
    // =========================================================

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getMyOrderById(
            Authentication authentication,
            @PathVariable Long orderId) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        OrderResponseDTO response =
                sellerOrderService.getMyOrderById(
                        sellerId,
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller order fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // SELLER - GET ORDERS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
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

        Long sellerId = getAuthenticatedSellerId(authentication);

        Page<OrderResponseDTO> response =
                sellerOrderService.getMyOrdersByStatus(
                        sellerId,
                        status,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller orders fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // AUTHENTICATED SELLER
    // =========================================================

    private Long getAuthenticatedSellerId(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authenticated seller is required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {

            throw new IllegalStateException(
                    "Authenticated user details not found"
            );
        }

        Long userId = userDetails.getUserId();

        if (userId == null || userId <= 0) {

            throw new IllegalStateException(
                    "Authenticated user ID is required"
            );
        }

        Seller seller =
                sellerRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Seller profile not found"
                                )
                        );

        if (!seller.isActive()) {

            throw new IllegalStateException(
                    "Seller account is inactive"
            );
        }

        return seller.getId();
    }
}