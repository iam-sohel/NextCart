package com.gesmio.havlook.seller_module.order_module.controller;

import com.gesmio.havlook.auth_module.security.CustomUserDetails;
import com.gesmio.havlook.common.dto.CommonResponseDto;
import com.gesmio.havlook.order_module.OrderStatus;
import com.gesmio.havlook.order_module.dto.OrderResponseDTO;
import com.gesmio.havlook.seller_module.auth.SellerAuthorizationService;
import com.gesmio.havlook.seller_module.order_module.service.SellerOrderService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

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
@SecurityRequirement(name = "bearerAuth")
public class SellerOrderController {

    private final SellerOrderService sellerOrderService;
    private final SellerAuthorizationService sellerAuthorizationService;

    // =========================================================
    // SELLER - GET MY ORDERS
    // =========================================================

    @GetMapping
    public ResponseEntity<
            CommonResponseDto<Page<OrderResponseDTO>>
            > getMyOrders(
            Authentication authentication,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Long sellerId =
                getAuthenticatedSellerId(authentication);

        Page<OrderResponseDTO> response =
                sellerOrderService.getMyOrders(
                        sellerId,
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<
            CommonResponseDto<OrderResponseDTO>
            > getMyOrderById(
            Authentication authentication,
            @PathVariable Long orderId) {

        Long sellerId =
                getAuthenticatedSellerId(authentication);

        OrderResponseDTO response =
                sellerOrderService.getMyOrderById(
                        sellerId,
                        orderId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<
            CommonResponseDto<Page<OrderResponseDTO>>
            > getMyOrdersByStatus(
            Authentication authentication,
            @PathVariable OrderStatus status,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Long sellerId =
                getAuthenticatedSellerId(authentication);

        Page<OrderResponseDTO> response =
                sellerOrderService.getMyOrdersByStatus(
                        sellerId,
                        status,
                        pageable
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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

        Long userId =
                userDetails.getUserId();

        if (userId == null || userId <= 0) {

            throw new IllegalStateException(
                    "Authenticated user ID is required"
            );
        }

        return sellerAuthorizationService
                .getAuthorizedSeller(userId)
                .getId();
    }
}