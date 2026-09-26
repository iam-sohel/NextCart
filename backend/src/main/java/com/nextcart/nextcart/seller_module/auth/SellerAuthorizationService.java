package com.nextcart.nextcart.seller_module.auth;

import com.nextcart.nextcart.seller_module.auth.exceptions.SellerInactiveException;
import com.nextcart.nextcart.seller_module.auth.exceptions.SellerNotFoundException;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;

import lombok.RequiredArgsConstructor;

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
                        new SellerNotFoundException(
                                "Authenticated user is not a seller"
                        )
                );

        /*
         * Seller must be active to access seller APIs.
         */
        if (!seller.isActive()) {
            throw new SellerInactiveException(
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