package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.admin_module.AdminSellerKycService;
import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycResponse;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/sellers")
@RequiredArgsConstructor
public class AdminSellerKycController {

    private final AdminSellerKycService adminSellerKycService;

    @GetMapping("/kyc")
    public ResponseEntity<ApiResponse<Page<SellerKycResponse>>> getAllKyc(
            @PageableDefault(
                    size = 20,
                    sort = "submittedAt",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<SellerKycResponse> response =
                adminSellerKycService.getAllKyc(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller KYC records fetched successfully",
                        response
                )
        );
    }

    @GetMapping("/kyc/pending")
    public ResponseEntity<ApiResponse<Page<SellerKycResponse>>> getPendingKyc(
            @PageableDefault(
                    size = 20,
                    sort = "submittedAt",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable) {

        Page<SellerKycResponse> response =
                adminSellerKycService.getPendingKyc(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Pending seller KYC records fetched successfully",
                        response
                )
        );
    }

    @GetMapping("/{sellerId}/kyc")
    public ResponseEntity<ApiResponse<SellerKycResponse>> getKycBySellerId(
            @PathVariable Long sellerId) {

        SellerKycResponse response =
                adminSellerKycService.getKycBySellerId(sellerId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller KYC details fetched successfully",
                        response
                )
        );
    }

    @PutMapping("/{sellerId}/kyc/approve")
    public ResponseEntity<ApiResponse<Void>> approveKyc(
            @PathVariable Long sellerId) {

        Long adminUserId = getLoggedInUserId();

        adminSellerKycService.approveKyc(
                sellerId,
                adminUserId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller KYC verified successfully",
                        null
                )
        );
    }

    @PutMapping("/{sellerId}/kyc/reject")
    public ResponseEntity<ApiResponse<Void>> rejectKyc(
            @PathVariable Long sellerId,
            @Valid @RequestBody KycRejectRequest request) {

        Long adminUserId = getLoggedInUserId();

        adminSellerKycService.rejectKyc(
                sellerId,
                adminUserId,
                request.getRejectionReason()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller KYC rejected successfully",
                        null
                )
        );
    }

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

    @Getter
    public static class KycRejectRequest {

        private String rejectionReason;
    }
}