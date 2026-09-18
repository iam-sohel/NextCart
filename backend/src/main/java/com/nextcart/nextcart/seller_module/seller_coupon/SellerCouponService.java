package com.nextcart.nextcart.seller_module.seller_coupon;

import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponCreateRequest;
import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponResponse;
import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponUpdateRequest;
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