package com.nextcart.nextcart.seller_module.dashboard.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.dashboard.dto.SellerDashboardResponse;
import com.nextcart.nextcart.seller_module.dashboard.service.SellerDashboardService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sellers/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
@SecurityRequirement(name = "bearerAuth")
public class SellerDashboardController {

    private final SellerDashboardService sellerDashboardService;

    // =========================================================
    // GET SELLER DASHBOARD
    // =========================================================

    @GetMapping
    public ResponseEntity<CommonResponseDto<SellerDashboardResponse>>
    getMyDashboard(
            Authentication authentication) {

        Long userId =
                getLoggedInUserId(authentication);

        SellerDashboardResponse response =
                sellerDashboardService.getMyDashboard(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller dashboard retrieved successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET LOGGED-IN USER ID
    // =========================================================

    private Long getLoggedInUserId(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            Long userId = userDetails.getUserId();

            if (userId == null || userId <= 0) {
                throw new IllegalStateException(
                        "Authenticated user ID is required"
                );
            }

            return userId;
        }

        try {

            return Long.valueOf(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            throw new IllegalStateException(
                    "Unable to determine authenticated user"
            );
        }
    }
}