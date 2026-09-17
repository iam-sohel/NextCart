package com.nextcart.nextcart.seller_module.payment_module;

import com.nextcart.nextcart.seller_module.payment_module.SellerEarningResponse;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SellerPaymentService {

    /**
     * Get all earnings belonging to the authenticated seller.
     */
    Page<SellerEarningResponse> getMyEarnings(
            Long sellerId,
            Pageable pageable
    );

    /**
     * Get a single earning belonging to the authenticated seller.
     */
    SellerEarningResponse getMyEarningById(
            Long sellerId,
            Long earningId
    );

    /**
     * Get earnings for a specific order belonging to the seller.
     */
    Page<SellerEarningResponse> getMyEarningsByOrder(
            Long sellerId,
            Long orderId,
            Pageable pageable
    );

    /**
     * Get earnings summary for the authenticated seller.
     */
    SellerEarningSummaryResponse getMyEarningsSummary(
            Long sellerId
    );
}