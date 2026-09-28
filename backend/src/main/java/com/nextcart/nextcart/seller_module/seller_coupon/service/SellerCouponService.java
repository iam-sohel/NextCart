package com.nextcart.nextcart.seller_module.seller_coupon.service;

import com.nextcart.nextcart.seller_module.seller_coupon.dto.SellerCouponUpdateRequest;
import com.nextcart.nextcart.seller_module.seller_coupon.dto.SellerCouponCreateRequest;
import com.nextcart.nextcart.seller_module.seller_coupon.dto.SellerCouponResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SellerCouponService {

    SellerCouponResponse createCoupon(
            Long sellerId,
            SellerCouponCreateRequest request
    );

    Page<SellerCouponResponse> getMyCoupons(
            Long sellerId,
            Pageable pageable
    );

    SellerCouponResponse getMyCouponById(
            Long sellerId,
            Long couponId
    );

    SellerCouponResponse updateCoupon(
            Long sellerId,
            Long couponId,
            SellerCouponUpdateRequest request
    );

    void activateCoupon(
            Long sellerId,
            Long couponId
    );

    void deactivateCoupon(
            Long sellerId,
            Long couponId
    );

    void deleteCoupon(
            Long sellerId,
            Long couponId
    );
}