package com.nextcart.nextcart.seller_module.seller.repository;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {

    Optional<Seller> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByGstNumberIgnoreCase(String gstNumber);
}