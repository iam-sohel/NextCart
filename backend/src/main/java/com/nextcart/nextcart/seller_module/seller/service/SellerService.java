package com.nextcart.nextcart.seller_module.seller.service;

import com.nextcart.nextcart.seller_module.seller.dto.SellerResponse;
import com.nextcart.nextcart.seller_module.seller.dto.SellerUpdateRequest;

public interface SellerService {

    SellerResponse getMySellerProfile(Long userId);

    SellerResponse updateMySellerProfile(
            Long userId,
            SellerUpdateRequest request
    );

    void deactivateMySellerAccount(Long userId);
}