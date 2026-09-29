package com.gesmio.havlook.admin_module.service;

import com.gesmio.havlook.admin_module.exceptions.AdminSellerNotFoundException;
import com.gesmio.havlook.admin_module.exceptions.AdminSellerStateException;
import com.gesmio.havlook.admin_module.exceptions.AdminSellerValidationException;
import com.gesmio.havlook.seller_module.seller.dto.SellerResponse;
import com.gesmio.havlook.seller_module.seller.entity.Seller;
import com.gesmio.havlook.seller_module.seller.repository.SellerRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSellerServiceImpl
        implements AdminSellerService {

    private final SellerRepository sellerRepository;

    // =========================================================
    // GET ALL SELLERS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<SellerResponse> getAllSellers(
            Pageable pageable
    ) {

        if (pageable == null) {
            throw new AdminSellerValidationException(
                    "Pageable information is required"
            );
        }

        return sellerRepository
                .findAll(pageable)
                .map(this::mapToResponse);
    }

    // =========================================================
    // GET SELLER BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerResponse getSellerById(
            Long sellerId
    ) {

        Seller seller =
                getSeller(sellerId);

        return mapToResponse(seller);
    }

    // =========================================================
    // ACTIVATE SELLER
    // =========================================================

    @Override
    public void activateSeller(
            Long sellerId
    ) {

        Seller seller =
                getSeller(sellerId);

        if (seller.isActive()) {
            throw new AdminSellerStateException(
                    "Seller is already active"
            );
        }

        seller.setActive(true);

        sellerRepository.save(seller);
    }

    // =========================================================
    // DEACTIVATE SELLER
    // =========================================================

    @Override
    public void deactivateSeller(
            Long sellerId
    ) {

        Seller seller =
                getSeller(sellerId);

        if (!seller.isActive()) {
            throw new AdminSellerStateException(
                    "Seller is already inactive"
            );
        }

        seller.setActive(false);

        sellerRepository.save(seller);
    }

    // =========================================================
    // GET SELLER
    // =========================================================

    private Seller getSeller(
            Long sellerId
    ) {

        if (sellerId == null ||
                sellerId <= 0) {

            throw new AdminSellerValidationException(
                    "Invalid seller id"
            );
        }

        return sellerRepository
                .findById(sellerId)
                .orElseThrow(() ->
                        new AdminSellerNotFoundException(
                                "Seller not found with id: "
                                        + sellerId
                        )
                );
    }

    // =========================================================
    // ENTITY -> RESPONSE
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