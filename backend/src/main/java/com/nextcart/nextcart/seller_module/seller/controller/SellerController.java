package com.nextcart.nextcart.seller_module.seller.controller;

import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.auth.SellerAuthorizationService;
import com.nextcart.nextcart.seller_module.seller.dto.SellerResponse;
import com.nextcart.nextcart.seller_module.seller.dto.SellerUpdateRequest;
import com.nextcart.nextcart.seller_module.seller.service.SellerService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sellers")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SellerController {

    private final SellerService sellerService;
    private final SellerAuthorizationService sellerAuthorizationService;


    // =========================================================
    // GET MY SELLER PROFILE
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SellerResponse>> getMySellerProfile(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        sellerAuthorizationService.getAuthorizedSeller(userId);

        SellerResponse response =
                sellerService.getMySellerProfile(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller profile retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // UPDATE MY SELLER PROFILE
    // =========================================================

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<SellerResponse>> updateMySellerProfile(
            Authentication authentication,
            @Valid @RequestBody SellerUpdateRequest request
    ) {

        Long userId = getUserId(authentication);

        sellerAuthorizationService.getAuthorizedSeller(userId);

        SellerResponse response =
                sellerService.updateMySellerProfile(
                        userId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller profile updated successfully",
                        response
                )
        );
    }


    // =========================================================
    // DEACTIVATE SELLER ACCOUNT
    // =========================================================

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deactivateMySellerAccount(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        sellerAuthorizationService.getAuthorizedSeller(userId);

        sellerService.deactivateMySellerAccount(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller account deactivated successfully",
                        null
                )
        );
    }


    // =========================================================
    // AUTHENTICATED USER ID
    // =========================================================

    private Long getUserId(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new org.springframework.security.access.AccessDeniedException(
                    "Authentication required"
            );
        }

        return Long.valueOf(authentication.getName());
    }
}