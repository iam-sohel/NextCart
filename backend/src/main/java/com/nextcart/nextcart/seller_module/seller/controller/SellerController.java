package com.nextcart.nextcart.seller_module.seller.controller;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.auth.SellerAuthorizationService;
import com.nextcart.nextcart.seller_module.seller.dto.SellerResponse;
import com.nextcart.nextcart.seller_module.seller.dto.SellerUpdateRequest;
import com.nextcart.nextcart.seller_module.seller.service.SellerService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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
    public ResponseEntity<CommonResponseDto<SellerResponse>> getMySellerProfile(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        sellerAuthorizationService.getAuthorizedSeller(userId);

        SellerResponse response =
                sellerService.getMySellerProfile(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<SellerResponse>> updateMySellerProfile(
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
                new CommonResponseDto<>(
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
    public ResponseEntity<CommonResponseDto<Void>> deactivateMySellerAccount(
            Authentication authentication
    ) {

        Long userId = getUserId(authentication);

        sellerAuthorizationService.getAuthorizedSeller(userId);

        sellerService.deactivateMySellerAccount(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
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

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        try {
            Long userId = Long.valueOf(authentication.getName());

            if (userId <= 0) {
                throw new AccessDeniedException(
                        "Authenticated user ID is invalid"
                );
            }

            return userId;

        } catch (NumberFormatException ex) {

            throw new AccessDeniedException(
                    "Authenticated user ID is invalid"
            );
        }
    }
}