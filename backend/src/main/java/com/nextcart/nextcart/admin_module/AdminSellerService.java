package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.seller_module.seller.dto.SellerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminSellerService {

    Page<SellerResponse> getAllSellers(Pageable pageable);

    SellerResponse getSellerById(Long sellerId);

    void activateSeller(Long sellerId);

    void deactivateSeller(Long sellerId);
}