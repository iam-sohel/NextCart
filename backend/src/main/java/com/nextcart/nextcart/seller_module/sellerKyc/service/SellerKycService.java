package com.nextcart.nextcart.seller_module.sellerKyc.service;

import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycRequest;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SellerKycService {

    SellerKycResponse submitKyc(Long userId, SellerKycRequest request);

    SellerKycResponse getMyKyc(Long userId);

    SellerKycResponse updateKyc(Long userId, SellerKycRequest request);

    SellerKycResponse getKycStatus(Long userId);

    SellerKycResponse uploadKycDocuments(Long userId, MultipartFile panDocument, MultipartFile aadhaarDocument, MultipartFile gstDocument, MultipartFile registrationDocument, MultipartFile addressDocument);
}