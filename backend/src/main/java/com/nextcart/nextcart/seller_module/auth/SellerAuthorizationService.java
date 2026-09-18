package com.nextcart.nextcart.seller_module.auth;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SellerAuthorizationService {

    private final SellerRepository sellerRepository;

    /**
     * Returns the seller associated with the authenticated user.
     *
     * This is the central authorization point for seller APIs.
     */
    public Seller getAuthorizedSeller(Long userId) {

        Seller seller = sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Authenticated user is not a seller"
                        )
                );

        /*
         * IMPORTANT:
         * Replace this with your actual seller status check.
         *
         * Example:
         * if (seller.getStatus() != SellerStatus.ACTIVE) { ... }
         *
         * Do NOT keep this line if your SellerEntity does not have isActive().
         */

        if (!seller.isActive()) {
            throw new AccessDeniedException(
                    "Seller account is not active"
            );
        }

        return seller;
    }

    /**
     * Returns the authorized seller ID.
     */
    public Long getAuthorizedSellerId(Long userId) {
        return getAuthorizedSeller(userId).getId();
    }
}