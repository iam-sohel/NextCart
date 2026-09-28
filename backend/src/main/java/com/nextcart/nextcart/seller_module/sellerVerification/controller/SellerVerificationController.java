package com.nextcart.nextcart.seller_module.sellerVerification.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.sellerVerification.entity.SellerVerification;
import com.nextcart.nextcart.seller_module.sellerVerification.service.SellerVerificationService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sellers/verification")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SellerVerificationController {

    private final SellerVerificationService sellerVerificationService;

    // =========================================================
    // START SELLER VERIFICATION
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<CommonResponseDto<SellerVerification>>
    verifySeller(
            Authentication authentication
    ) {

        Long sellerId =
                getAuthenticatedUserId(authentication);

        SellerVerification verification =
                sellerVerificationService.verifySeller(
                        sellerId
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Seller verification completed",
                                verification
                        )
                );
    }

    // =========================================================
    // GET MY VERIFICATION
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<CommonResponseDto<SellerVerification>>
    getMyVerification(
            Authentication authentication
    ) {

        Long sellerId =
                getAuthenticatedUserId(authentication);

        SellerVerification verification =
                sellerVerificationService.getVerification(
                        sellerId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller verification retrieved successfully",
                        verification
                )
        );
    }

    // =========================================================
    // ADMIN APPROVE SELLER
    // =========================================================

    @PutMapping("/{sellerId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<SellerVerification>>
    approveSeller(
            Authentication authentication,
            @PathVariable Long sellerId
    ) {

        Long adminUserId =
                getAuthenticatedUserId(authentication);

        SellerVerification verification =
                sellerVerificationService.approveSeller(
                        sellerId,
                        adminUserId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller approved successfully",
                        verification
                )
        );
    }

    // =========================================================
    // ADMIN REJECT SELLER
    // =========================================================

    @PutMapping("/{sellerId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponseDto<SellerVerification>>
    rejectSeller(
            Authentication authentication,
            @PathVariable Long sellerId,
            @RequestParam String reason
    ) {

        Long adminUserId =
                getAuthenticatedUserId(authentication);

        SellerVerification verification =
                sellerVerificationService.rejectSeller(
                        sellerId,
                        adminUserId,
                        reason
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller rejected successfully",
                        verification
                )
        );
    }

    // =========================================================
    // GET AUTHENTICATED USER ID
    // =========================================================

    private Long getAuthenticatedUserId(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            Long userId = userDetails.getUserId();

            if (userId == null || userId <= 0) {
                throw new AccessDeniedException(
                        "Authenticated user ID is invalid"
                );
            }

            return userId;
        }

        try {

            Long userId =
                    Long.valueOf(authentication.getName());

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