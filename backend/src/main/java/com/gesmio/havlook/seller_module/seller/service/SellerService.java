package com.gesmio.havlook.seller_module.seller.service;

import com.gesmio.havlook.seller_module.seller.dto.SellerResponse;
import com.gesmio.havlook.seller_module.seller.dto.SellerUpdateRequest;

public interface SellerService {

    SellerResponse getMySellerProfile(Long userId);

    SellerResponse updateMySellerProfile(
            Long userId,
            SellerUpdateRequest request
    );

    void deactivateMySellerAccount(Long userId);
}