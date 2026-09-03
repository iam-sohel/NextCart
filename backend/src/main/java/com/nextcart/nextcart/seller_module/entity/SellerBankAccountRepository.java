package com.nextcart.nextcart.seller_module.entity;

import com.nextcart.nextcart.seller_module.entity.SellerBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerBankAccountRepository
        extends JpaRepository<SellerBankAccount, Long> {

    Optional<SellerBankAccount> findBySellerId(Long sellerId);

    boolean existsBySellerId(Long sellerId);
}