package com.gesmio.havlook.admin_module.controller;

import com.gesmio.havlook.admin_module.service.AdminSellerKycService;
import com.gesmio.havlook.auth_module.security.CustomUserDetails;
import com.gesmio.havlook.common.dto.CommonResponseDto;
import com.gesmio.havlook.seller_module.sellerKyc.dto.SellerKycResponse;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/sellers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminSellerKycController {

    private final AdminSellerKycService adminSellerKycService;

    // =========================================================
    // GET ALL SELLER KYC
    // =========================================================

    @GetMapping("/kyc")
    public ResponseEntity<
            CommonResponseDto<Page<SellerKycResponse>>
            > getAllKyc(
            @PageableDefault(
                    size = 20,
                    sort = "submittedAt",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<SellerKycResponse> response =
                adminSellerKycService.getAllKyc(pageable);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller KYC records fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET PENDING SELLER KYC
    // =========================================================

    @GetMapping("/kyc/pending")
    public ResponseEntity<
            CommonResponseDto<Page<SellerKycResponse>>
            > getPendingKyc(
            @PageableDefault(
                    size = 20,
                    sort = "submittedAt",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<SellerKycResponse> response =
                adminSellerKycService.getPendingKyc(pageable);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Pending seller KYC records fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET KYC BY SELLER ID
    // =========================================================

    @GetMapping("/{sellerId}/kyc")
    public ResponseEntity<
            CommonResponseDto<SellerKycResponse>
            > getKycBySellerId(
            @PathVariable Long sellerId) {

        SellerKycResponse response =
                adminSellerKycService.getKycBySellerId(sellerId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller KYC details fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // APPROVE KYC
    // =========================================================

    @PutMapping("/{sellerId}/kyc/approve")
    public ResponseEntity<CommonResponseDto<Void>> approveKyc(
            @PathVariable Long sellerId) {

        Long adminUserId = getLoggedInUserId();

        adminSellerKycService.approveKyc(
                sellerId,
                adminUserId
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller KYC verified successfully",
                        null
                )
        );
    }

    // =========================================================
    // REJECT KYC
    // =========================================================

    @PutMapping("/{sellerId}/kyc/reject")
    public ResponseEntity<CommonResponseDto<Void>> rejectKyc(
            @PathVariable Long sellerId,
            @Valid @RequestBody KycRejectRequest request) {

        Long adminUserId = getLoggedInUserId();

        adminSellerKycService.rejectKyc(
                sellerId,
                adminUserId,
                request.getRejectionReason()
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller KYC rejected successfully",
                        null
                )
        );
    }

    // =========================================================
    // GET LOGGED-IN ADMIN USER ID
    // =========================================================

    private Long getLoggedInUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !(authentication.getPrincipal()
                        instanceof CustomUserDetails userDetails)) {

            throw new IllegalStateException(
                    "Authenticated user details not found"
            );
        }

        return userDetails.getUserId();
    }

    // =========================================================
    // KYC REJECTION REQUEST
    // =========================================================

    @Getter
    public static class KycRejectRequest {

        @NotBlank(message = "Rejection reason is required")
        @Size(
                max = 1000,
                message = "Rejection reason must not exceed 1000 characters"
        )
        private String rejectionReason;
    }
}