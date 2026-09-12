package com.nextcart.nextcart.seller_module.sellerBank.service;

import com.nextcart.nextcart.seller_module.sellerBank.dto.SellerBankRequest;
import com.nextcart.nextcart.seller_module.sellerBank.dto.SellerBankResponse;

public interface SellerBankService {

    SellerBankResponse addBankAccount(
            Long userId,
            SellerBankRequest request
    );

    SellerBankResponse getMyBankAccount(
            Long userId
    );

    SellerBankResponse updateBankAccount(
            Long userId,
            SellerBankRequest request
    );

    void deactivateBankAccount(
            Long userId
    );
}