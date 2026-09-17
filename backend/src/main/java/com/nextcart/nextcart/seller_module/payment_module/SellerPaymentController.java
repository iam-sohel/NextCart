package com.nextcart.nextcart.seller_module.payment_module;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningResponse;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningSummaryResponse;
import com.nextcart.nextcart.seller_module.payment_module.SellerPaymentService;
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
@RequestMapping("/api/v1/sellers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerPaymentController {

    private final SellerPaymentService sellerPaymentService;
    private final SellerRepository sellerRepository;

    // =========================================================
    // PAYMENTS / EARNINGS
    // =========================================================

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Page<SellerEarningResponse>>> getMyPayments(
            Authentication authentication,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        Page<SellerEarningResponse> response =
                sellerPaymentService.getMyEarnings(
                        sellerId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller payments fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // SINGLE PAYMENT / EARNING
    // =========================================================

    @GetMapping("/payments/{earningId}")
    public ResponseEntity<ApiResponse<SellerEarningResponse>> getMyPayment(
            Authentication authentication,
            @PathVariable Long earningId) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        SellerEarningResponse response =
                sellerPaymentService.getMyEarningById(
                        sellerId,
                        earningId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller payment fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // PAYMENTS BY ORDER
    // =========================================================

    @GetMapping("/payments/order/{orderId}")
    public ResponseEntity<ApiResponse<Page<SellerEarningResponse>>> getMyPaymentsByOrder(
            Authentication authentication,
            @PathVariable Long orderId,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        Page<SellerEarningResponse> response =
                sellerPaymentService.getMyEarningsByOrder(
                        sellerId,
                        orderId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller order payments fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // EARNINGS
    // =========================================================

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<Page<SellerEarningResponse>>> getMyEarnings(
            Authentication authentication,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        Page<SellerEarningResponse> response =
                sellerPaymentService.getMyEarnings(
                        sellerId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller earnings fetched successfully",
                        response
                )
        );
    }

    // =========================================================
    // EARNINGS SUMMARY
    // =========================================================

    @GetMapping("/earnings/summary")
    public ResponseEntity<ApiResponse<SellerEarningSummaryResponse>> getMyEarningsSummary(
            Authentication authentication) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        SellerEarningSummaryResponse response =
                sellerPaymentService.getMyEarningsSummary(
                        sellerId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Seller earnings summary fetched successfully",
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

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {

            throw new IllegalStateException(
                    "Authenticated user details not found"
            );
        }

        Long userId = userDetails.getUserId();

        if (userId == null || userId <= 0) {

            throw new IllegalStateException(
                    "Authenticated user ID is required"
            );
        }

        Seller seller =
                sellerRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Seller profile not found"
                                )
                        );

        if (!seller.isActive()) {

            throw new IllegalStateException(
                    "Seller account is inactive"
            );
        }

        return seller.getId();
    }
}