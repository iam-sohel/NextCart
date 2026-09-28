package com.nextcart.nextcart.admin_module.controller;

import com.nextcart.nextcart.admin_module.service.AdminSellerVerificationService;
import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.sellerVerification.entity.SellerVerification;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/sellers/verification")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminSellerVerificationController {

    private final AdminSellerVerificationService adminSellerVerificationService;

    // =========================================================
    // GET ALL SELLER VERIFICATIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<
            CommonResponseDto<Page<SellerVerification>>
            > getAllVerifications(
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Page<SellerVerification> response =
                adminSellerVerificationService
                        .getAllVerifications(pageable);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller verifications fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET PENDING SELLER VERIFICATIONS
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<
            CommonResponseDto<Page<SellerVerification>>
            > getPendingVerifications(
            @PageableDefault(
                    size = 20,
                    sort = "completedAt",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<SellerVerification> response =
                adminSellerVerificationService
                        .getPendingVerifications(pageable);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Pending seller verifications fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET SELLER VERIFICATION BY SELLER ID
    // =========================================================

    @GetMapping("/{sellerId}")
    public ResponseEntity<
            CommonResponseDto<SellerVerification>
            > getVerificationBySellerId(
            @PathVariable Long sellerId) {

        SellerVerification response =
                adminSellerVerificationService
                        .getVerificationBySellerId(sellerId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller verification fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // APPROVE SELLER
    // =========================================================

    @PutMapping("/{sellerId}/approve")
    public ResponseEntity<
            CommonResponseDto<SellerVerification>
            > approveVerification(
            @PathVariable Long sellerId,
            Authentication authentication) {

        Long adminUserId = getUserId(authentication);

        SellerVerification response =
                adminSellerVerificationService
                        .approveVerification(
                                sellerId,
                                adminUserId
                        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller verification approved successfully",
                        response
                )
        );
    }

    // =========================================================
    // REJECT SELLER
    // =========================================================

    @PutMapping("/{sellerId}/reject")
    public ResponseEntity<
            CommonResponseDto<SellerVerification>
            > rejectVerification(
            @PathVariable Long sellerId,
            @Valid @RequestBody SellerVerificationRejectRequest request,
            Authentication authentication) {

        Long adminUserId = getUserId(authentication);

        SellerVerification response =
                adminSellerVerificationService
                        .rejectVerification(
                                sellerId,
                                adminUserId,
                                request.getReason()
                        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller verification rejected successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET AUTHENTICATED ADMIN USER ID
    // =========================================================

    private Long getUserId(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authentication required"
            );
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        }

        try {
            return Long.parseLong(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            throw new IllegalStateException(
                    "Unable to determine authenticated admin user"
            );
        }
    }

    // =========================================================
    // REJECTION REQUEST DTO
    // =========================================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerVerificationRejectRequest {

        @NotBlank(message = "Rejection reason is required")
        @Size(
                max = 1000,
                message = "Rejection reason must not exceed 1000 characters"
        )
        private String reason;
    }
}