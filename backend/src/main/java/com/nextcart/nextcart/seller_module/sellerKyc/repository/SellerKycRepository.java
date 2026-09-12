package com.nextcart.nextcart.seller_module.sellerKyc.repository;

import com.nextcart.nextcart.seller_module.sellerKyc.entity.SellerKyc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerKycRepository
        extends JpaRepository<SellerKyc, Long> {

    Optional<SellerKyc> findBySellerId(Long sellerId);

    boolean existsBySellerId(Long sellerId);
}