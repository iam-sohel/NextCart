package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminSellerKycService {

    Page<SellerKycResponse> getAllKyc(Pageable pageable);

    Page<SellerKycResponse> getPendingKyc(Pageable pageable);

    SellerKycResponse getKycBySellerId(Long sellerId);

    void approveKyc(Long sellerId, Long adminUserId);

    void rejectKyc(
            Long sellerId,
            Long adminUserId,
            String rejectionReason
    );
}