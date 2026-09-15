package com.nextcart.nextcart.seller_module.sellerKyc.repository;

import com.nextcart.nextcart.seller_module.sellerKyc.entity.KycStatus;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.SellerKyc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerKycRepository
        extends JpaRepository<SellerKyc, Long> {

    Optional<SellerKyc> findBySellerId(Long sellerId);

    boolean existsBySellerId(Long sellerId);

    boolean existsByPanNumberIgnoreCase(String panNumber);

    boolean existsByGstNumberIgnoreCase(String gstNumber);

    List<SellerKyc> findAllByStatusOrderBySubmittedAtAsc(
            KycStatus status
    );
}