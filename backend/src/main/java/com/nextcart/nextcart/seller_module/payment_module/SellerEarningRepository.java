package com.nextcart.nextcart.seller_module.payment_module;

import com.nextcart.nextcart.seller_module.payment_module.SellerEarningEntity;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerEarningRepository
        extends JpaRepository<SellerEarningEntity, Long> {

    // =========================================================
    // SELLER EARNINGS
    // =========================================================

    Page<SellerEarningEntity> findBySellerId(
            Long sellerId,
            Pageable pageable
    );

    // =========================================================
    // SELLER EARNINGS BY STATUS
    // =========================================================

    Page<SellerEarningEntity> findBySellerIdAndStatus(
            Long sellerId,
            SellerEarningStatus status,
            Pageable pageable
    );

    // =========================================================
    // SINGLE EARNING
    // =========================================================

    Optional<SellerEarningEntity> findByIdAndSellerId(
            Long id,
            Long sellerId
    );

    // =========================================================
    // ORDER ITEM
    // =========================================================

    Optional<SellerEarningEntity> findByOrderItemId(
            Long orderItemId
    );

    boolean existsByOrderItemId(
            Long orderItemId
    );

    // =========================================================
    // ORDER
    // =========================================================

    Page<SellerEarningEntity> findBySellerIdAndOrderId(
            Long sellerId,
            Long orderId,
            Pageable pageable
    );
}