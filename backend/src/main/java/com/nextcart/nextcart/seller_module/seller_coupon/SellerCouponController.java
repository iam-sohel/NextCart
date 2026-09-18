package com.nextcart.nextcart.seller_module.seller_coupon;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.ApiResponse;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sellers/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerCouponController {

    private final SellerCouponService sellerCouponService;
    private final SellerRepository sellerRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<SellerCouponResponse>> createCoupon(
            Authentication authentication,
            @Valid @RequestBody SellerCouponCreateRequest request
    ) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        SellerCouponResponse response =
                sellerCouponService.createCoupon(
                        sellerId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Coupon created successfully",
                                response
                        )
                );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SellerCouponResponse>>> getMyCoupons(
            Authentication authentication,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        Page<SellerCouponResponse> response =
                sellerCouponService.getMyCoupons(
                        sellerId,
                        pageable
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupons fetched successfully",
                        response
                )
        );
    }

    @GetMapping("/{couponId}")
    public ResponseEntity<ApiResponse<SellerCouponResponse>> getCouponById(
            Authentication authentication,
            @PathVariable Long couponId
    ) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        SellerCouponResponse response =
                sellerCouponService.getMyCouponById(
                        sellerId,
                        couponId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupon fetched successfully",
                        response
                )
        );
    }

    @PutMapping("/{couponId}")
    public ResponseEntity<ApiResponse<SellerCouponResponse>> updateCoupon(
            Authentication authentication,
            @PathVariable Long couponId,
            @Valid @RequestBody SellerCouponUpdateRequest request
    ) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        SellerCouponResponse response =
                sellerCouponService.updateCoupon(
                        sellerId,
                        couponId,
                        request
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupon updated successfully",
                        response
                )
        );
    }

    @PutMapping("/{couponId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateCoupon(
            Authentication authentication,
            @PathVariable Long couponId
    ) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        sellerCouponService.activateCoupon(
                sellerId,
                couponId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupon activated successfully",
                        null
                )
        );
    }

    @PutMapping("/{couponId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateCoupon(
            Authentication authentication,
            @PathVariable Long couponId
    ) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        sellerCouponService.deactivateCoupon(
                sellerId,
                couponId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupon deactivated successfully",
                        null
                )
        );
    }

    @DeleteMapping("/{couponId}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(
            Authentication authentication,
            @PathVariable Long couponId
    ) {

        Long sellerId = getAuthenticatedSellerId(authentication);

        sellerCouponService.deleteCoupon(
                sellerId,
                couponId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupon deleted successfully",
                        null
                )
        );
    }

    private Long getAuthenticatedSellerId(
            Authentication authentication
    ) {

        Object principal = authentication.getPrincipal();

        Long userId;

        if (principal instanceof CustomUserDetails userDetails) {
            userId = userDetails.getUserId();
        } else {
            userId = Long.valueOf(authentication.getName());
        }

        Seller seller =
                sellerRepository
                        .findByUserId(userId)
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