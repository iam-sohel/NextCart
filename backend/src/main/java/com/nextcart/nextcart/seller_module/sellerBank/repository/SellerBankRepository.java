package com.nextcart.nextcart.seller_module.sellerBank.repository;

import com.nextcart.nextcart.seller_module.sellerBank.entity.SellerBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerBankRepository
        extends JpaRepository<SellerBankAccount, Long> {

    Optional<SellerBankAccount> findBySellerId(Long sellerId);

    boolean existsBySellerId(Long sellerId);
}