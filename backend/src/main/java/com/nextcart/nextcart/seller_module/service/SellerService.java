package com.nextcart.nextcart.seller_module.service;

import com.nextcart.nextcart.seller_module.dto.SellerBankAccountRequest;
import com.nextcart.nextcart.seller_module.dto.SellerBankAccountResponse;
import com.nextcart.nextcart.seller_module.dto.SellerKycRequest;
import com.nextcart.nextcart.seller_module.dto.SellerKycResponse;
import com.nextcart.nextcart.seller_module.dto.SellerResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SellerService {

    SellerResponse getMySellerProfile(String email);

    SellerKycResponse submitKyc(
            String email,
            SellerKycRequest request
    );

    SellerKycResponse getMyKyc(String email);

    SellerBankAccountResponse addBankAccount(
            String email,
            SellerBankAccountRequest request
    );

    SellerBankAccountResponse getMyBankAccount(String email);

    void updateKycDocuments(
            String email,
            MultipartFile panDocument,
            MultipartFile aadhaarDocument,
            MultipartFile gstDocument
    );
}