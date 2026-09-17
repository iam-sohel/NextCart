package com.nextcart.nextcart.seller_module.analytics.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.analytics.dto.SellerAnalyticsResponse;
import com.nextcart.nextcart.seller_module.analytics.service.SellerAnalyticsService;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
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
public class SellerAnalyticsController {

    private final SellerAnalyticsService sellerAnalyticsService;
    private final SellerRepository sellerRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<SellerAnalyticsResponse>> getAnalytics(
            Authentication authentication,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        Long userId = getUserId(authentication);

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException("Seller profile not found"));

        if (!seller.isActive()) {
            throw new IllegalStateException(
                    "Seller account is inactive"
            );
        }

        SellerAnalyticsResponse response =
                sellerAnalyticsService.getAnalytics(
                        seller.getId(),
                        from,
                        to
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller analytics fetched successfully",
                        response
                )
        );
    }

    private Long getUserId(Authentication authentication) {

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        }

        return Long.valueOf(authentication.getName());
    }
}