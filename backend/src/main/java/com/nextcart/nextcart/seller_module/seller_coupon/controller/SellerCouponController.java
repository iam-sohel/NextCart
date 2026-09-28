package com.nextcart.nextcart.seller_module.seller_coupon.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.seller_module.auth.SellerAuthorizationService;
import com.nextcart.nextcart.seller_module.seller_coupon.dto.SellerCouponCreateRequest;
import com.nextcart.nextcart.seller_module.seller_coupon.dto.SellerCouponResponse;
import com.nextcart.nextcart.seller_module.seller_coupon.dto.SellerCouponUpdateRequest;
import com.nextcart.nextcart.seller_module.seller_coupon.service.SellerCouponService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sellers/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
@SecurityRequirement(name = "bearerAuth")
public class SellerCouponController {

    private final SellerCouponService sellerCouponService;

    private final SellerAuthorizationService sellerAuthorizationService;

    // =========================================================
    // CREATE COUPON
    // =========================================================

    @PostMapping
    public ResponseEntity<CommonResponseDto<SellerCouponResponse>>
    createCoupon(
            Authentication authentication,
            @Valid @RequestBody SellerCouponCreateRequest request
    ) {

        Long userId =
                getUserId(authentication);

        Long sellerId =
                sellerAuthorizationService
                        .getAuthorizedSeller(userId)
                        .getId();

        SellerCouponResponse response =
                sellerCouponService.createCoupon(
                        sellerId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Coupon created successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET MY COUPONS
    // =========================================================

    @GetMapping
    public ResponseEntity<
            CommonResponseDto<Page<SellerCouponResponse>>
            >
    getMyCoupons(
            Authentication authentication,

            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        Long userId =
                getUserId(authentication);

        Long sellerId =
                sellerAuthorizationService
                        .getAuthorizedSeller(userId)
                        .getId();

        Page<SellerCouponResponse> response =
                sellerCouponService.getMyCoupons(
                        sellerId,
                        pageable
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Coupons fetched successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET COUPON BY ID
    // =========================================================

    @GetMapping("/{couponId}")
    public ResponseEntity<CommonResponseDto<SellerCouponResponse>>
    getCouponById(
            Authentication authentication,
            @PathVariable Long couponId
    ) {

        Long userId =
                getUserId(authentication);

        Long sellerId =
                sellerAuthorizationService
                        .getAuthorizedSeller(userId)
                        .getId();

        SellerCouponResponse response =
                sellerCouponService.getMyCouponById(
                        sellerId,
                        couponId
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Coupon fetched successfully",
                                response
                        )
                );
    }

    // =========================================================
    // UPDATE COUPON
    // =========================================================

    @PutMapping("/{couponId}")
    public ResponseEntity<CommonResponseDto<SellerCouponResponse>>
    updateCoupon(
            Authentication authentication,
            @PathVariable Long couponId,
            @Valid @RequestBody SellerCouponUpdateRequest request
    ) {

        Long userId =
                getUserId(authentication);

        Long sellerId =
                sellerAuthorizationService
                        .getAuthorizedSeller(userId)
                        .getId();

        SellerCouponResponse response =
                sellerCouponService.updateCoupon(
                        sellerId,
                        couponId,
                        request
                );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Coupon updated successfully",
                                response
                        )
                );
    }

    // =========================================================
    // ACTIVATE COUPON
    // =========================================================

    @PutMapping("/{couponId}/activate")
    public ResponseEntity<CommonResponseDto<Void>>
    activateCoupon(
            Authentication authentication,
            @PathVariable Long couponId
    ) {

        Long userId =
                getUserId(authentication);

        Long sellerId =
                sellerAuthorizationService
                        .getAuthorizedSeller(userId)
                        .getId();

        sellerCouponService.activateCoupon(
                sellerId,
                couponId
        );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Coupon activated successfully",
                                null
                        )
                );
    }

    // =========================================================
    // DEACTIVATE COUPON
    // =========================================================

    @PutMapping("/{couponId}/deactivate")
    public ResponseEntity<CommonResponseDto<Void>>
    deactivateCoupon(
            Authentication authentication,
            @PathVariable Long couponId
    ) {

        Long userId =
                getUserId(authentication);

        Long sellerId =
                sellerAuthorizationService
                        .getAuthorizedSeller(userId)
                        .getId();

        sellerCouponService.deactivateCoupon(
                sellerId,
                couponId
        );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Coupon deactivated successfully",
                                null
                        )
                );
    }

    // =========================================================
    // DELETE COUPON
    // =========================================================

    @DeleteMapping("/{couponId}")
    public ResponseEntity<CommonResponseDto<Void>>
    deleteCoupon(
            Authentication authentication,
            @PathVariable Long couponId
    ) {

        Long userId =
                getUserId(authentication);

        Long sellerId =
                sellerAuthorizationService
                        .getAuthorizedSeller(userId)
                        .getId();

        sellerCouponService.deleteCoupon(
                sellerId,
                couponId
        );

        return ResponseEntity
                .ok(
                        new CommonResponseDto<>(
                                true,
                                "Coupon deleted successfully",
                                null
                        )
                );
    }

    // =========================================================
    // AUTHENTICATED USER ID
    // =========================================================

    private Long getUserId(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Authentication required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            Long userId =
                    userDetails.getUserId();

            if (userId == null || userId <= 0) {

                throw new AccessDeniedException(
                        "Invalid authenticated user"
                );
            }

            return userId;
        }

        try {

            return Long.valueOf(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            throw new AccessDeniedException(
                    "Invalid authenticated user"
            );
        }
    }
}