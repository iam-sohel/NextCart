package com.nextcart.nextcart.seller_module.analytics.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.analytics.dto.SellerAnalyticsResponse;
import com.nextcart.nextcart.seller_module.analytics.service.SellerAnalyticsService;
import com.nextcart.nextcart.seller_module.auth.SellerAuthorizationService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/sellers/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
@SecurityRequirement(name = "bearerAuth")
public class SellerAnalyticsController {

    private final SellerAnalyticsService sellerAnalyticsService;
    private final SellerAuthorizationService sellerAuthorizationService;

    // =========================================================
    // GET SELLER ANALYTICS
    // =========================================================

    @GetMapping
    public ResponseEntity<CommonResponseDto<SellerAnalyticsResponse>>
    getAnalytics(
            Authentication authentication,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        Long sellerId =
                getAuthenticatedSellerId(authentication);

        SellerAnalyticsResponse response =
                sellerAnalyticsService.getAnalytics(
                        sellerId,
                        from,
                        to
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller analytics fetched successfully",
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