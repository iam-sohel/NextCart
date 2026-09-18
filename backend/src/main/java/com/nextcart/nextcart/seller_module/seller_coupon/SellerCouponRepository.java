package com.nextcart.nextcart.seller_module.seller_coupon;

import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerCouponRepository
        extends JpaRepository<SellerCouponEntity, Long> {

    Page<SellerCouponEntity> findBySellerId(
            Long sellerId,
            Pageable pageable
    );

    Optional<SellerCouponEntity> findByIdAndSellerId(
            Long id,
            Long sellerId
    );

    Optional<SellerCouponEntity> findBySellerIdAndCodeIgnoreCase(
            Long sellerId,
            String code
    );

    boolean existsBySellerIdAndCodeIgnoreCase(
            Long sellerId,
            String code
    );

    boolean existsBySellerIdAndCodeIgnoreCaseAndIdNot(
            Long sellerId,
            String code,
            Long id
    );

    Page<SellerCouponEntity> findBySellerIdAndActive(
            Long sellerId,
            boolean active,
            Pageable pageable
    );
}