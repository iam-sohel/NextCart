package com.gesmio.havlook.seller_module.seller.service;

import com.gesmio.havlook.seller_module.seller.dto.SellerResponse;
import com.gesmio.havlook.seller_module.seller.dto.SellerUpdateRequest;
import com.gesmio.havlook.seller_module.seller.entity.Seller;
import com.gesmio.havlook.seller_module.seller.exceptions.SellerNotFoundException;
import com.gesmio.havlook.seller_module.seller.exceptions.SellerValidationException;
import com.gesmio.havlook.seller_module.seller.repository.SellerRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerServiceImpl implements SellerService {

    private final SellerRepository sellerRepository;

    // =========================================================
    // GET MY SELLER PROFILE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerResponse getMySellerProfile(Long userId) {

        Seller seller = getSellerByUserId(userId);

        return mapToResponse(seller);
    }

    // =========================================================
    // UPDATE MY SELLER PROFILE
    // =========================================================

    @Override
    public SellerResponse updateMySellerProfile(
            Long userId,
            SellerUpdateRequest request
    ) {

        if (request == null) {
            throw new SellerValidationException(
                    "Seller update request is required"
            );
        }

        Seller seller = getSellerByUserId(userId);

        if (request.getBusinessName() != null
                && !request.getBusinessName().isBlank()) {

            seller.setBusinessName(
                    request.getBusinessName().trim()
            );
        }

        Seller savedSeller =
                sellerRepository.save(seller);

        return mapToResponse(savedSeller);
    }

    // =========================================================
    // DEACTIVATE SELLER
    // =========================================================

    @Override
    public void deactivateMySellerAccount(Long userId) {

        Seller seller = getSellerByUserId(userId);

        seller.setActive(false);

        sellerRepository.save(seller);
    }

    // =========================================================
    // GET SELLER
    // =========================================================

    private Seller getSellerByUserId(Long userId) {

        if (userId == null || userId <= 0) {

            throw new SellerValidationException(
                    "Invalid user id"
            );
        }

        return sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new SellerNotFoundException(
                                "Seller profile not found"
                        )
                );
    }

    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private SellerResponse mapToResponse(
            Seller seller
    ) {

        return SellerResponse.builder()

                .sellerId(
                        seller.getId()
                )

                .userId(
                        seller.getUser().getId()
                )

                .firstName(
                        seller.getUser().getFirstName()
                )

                .lastName(
                        seller.getUser().getLastName()
                )

                .email(
                        seller.getUser().getEmail()
                )

                .phone(
                        seller.getUser().getPhone()
                )

                .businessName(
                        seller.getBusinessName()
                )

                .gstNumber(
                        seller.getGstNumber()
                )

                .verified(
                        seller.isVerified()
                )

                .active(
                        seller.isActive()
                )

                .build();
    }
}