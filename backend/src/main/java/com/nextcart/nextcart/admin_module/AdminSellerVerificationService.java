package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.seller_module.sellerVerification.SellerVerification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminSellerVerificationService {

    /**
     * Get all seller verification records.
     */
    Page<SellerVerification> getAllVerifications(Pageable pageable);

    /**
     * Get seller verification records waiting for admin review.
     */
    Page<SellerVerification> getPendingVerifications(Pageable pageable);

    /**
     * Get verification details for a specific seller.
     */
    SellerVerification getVerificationBySellerId(Long sellerId);

    /**
     * Approve seller verification.
     *
     * @param sellerId seller being approved
     * @param adminUserId authenticated admin user ID
     */
    SellerVerification approveVerification(
            Long sellerId,
            Long adminUserId
    );

    /**
     * Reject seller verification.
     *
     * @param sellerId seller being rejected
     * @param adminUserId authenticated admin user ID
     * @param reason rejection reason
     */
    SellerVerification rejectVerification(
            Long sellerId,
            Long adminUserId,
            String reason
    );
}