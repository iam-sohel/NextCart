package com.nextcart.nextcart.seller_module.sellerVerification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerVerificationRepository
        extends JpaRepository<SellerVerification, Long> {

    Optional<SellerVerification> findBySellerId(Long sellerId);

    boolean existsBySellerId(Long sellerId);

    Optional<SellerVerification> findBySellerIdAndOverallStatus(
            Long sellerId,
            SellerVerificationStatus overallStatus
    );

    Page<SellerVerification> findAllByOverallStatus(
            SellerVerificationStatus overallStatus,
            Pageable pageable
    );
}