package com.nextcart.nextcart.admin_module.service;

import com.nextcart.nextcart.admin_module.exceptions.AdminSellerKycNotFoundException;
import com.nextcart.nextcart.admin_module.exceptions.AdminSellerKycStateException;
import com.nextcart.nextcart.admin_module.exceptions.AdminSellerKycValidationException;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycResponse;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.KycStatus;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.SellerKyc;
import com.nextcart.nextcart.seller_module.sellerKyc.repository.SellerKycRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSellerKycServiceImpl
        implements AdminSellerKycService {

    private final SellerKycRepository sellerKycRepository;

    // =========================================================
    // GET ALL KYC
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<SellerKycResponse> getAllKyc(
            Pageable pageable
    ) {

        if (pageable == null) {
            throw new AdminSellerKycValidationException(
                    "Pageable information is required"
            );
        }

        return sellerKycRepository
                .findAll(pageable)
                .map(this::mapToResponse);
    }

    // =========================================================
    // GET PENDING KYC
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<SellerKycResponse> getPendingKyc(
            Pageable pageable
    ) {

        if (pageable == null) {
            throw new AdminSellerKycValidationException(
                    "Pageable information is required"
            );
        }

        return sellerKycRepository
                .findAllByStatus(
                        KycStatus.PENDING,
                        pageable
                )
                .map(this::mapToResponse);
    }

    // =========================================================
    // GET KYC BY SELLER ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerKycResponse getKycBySellerId(
            Long sellerId
    ) {

        SellerKyc sellerKyc =
                getSellerKyc(sellerId);

        return mapToResponse(sellerKyc);
    }

    // =========================================================
    // APPROVE KYC
    // =========================================================

    @Override
    public void approveKyc(
            Long sellerId,
            Long adminUserId
    ) {

        validateIds(
                sellerId,
                adminUserId
        );

        SellerKyc sellerKyc =
                getSellerKyc(sellerId);

        if (sellerKyc.getStatus() ==
                KycStatus.VERIFIED) {

            return;
        }

        if (sellerKyc.getStatus() !=
                KycStatus.PENDING) {

            throw new AdminSellerKycStateException(
                    "Only pending KYC can be approved"
            );
        }

        sellerKyc.setStatus(
                KycStatus.VERIFIED
        );

        sellerKyc.setRejectionReason(null);

        sellerKyc.setReviewedAt(
                LocalDateTime.now()
        );

        sellerKyc.setReviewedBy(
                adminUserId
        );

        sellerKycRepository.save(
                sellerKyc
        );
    }

    // =========================================================
    // REJECT KYC
    // =========================================================

    @Override
    public void rejectKyc(
            Long sellerId,
            Long adminUserId,
            String rejectionReason
    ) {

        validateIds(
                sellerId,
                adminUserId
        );

        if (rejectionReason == null ||
                rejectionReason.isBlank()) {

            throw new AdminSellerKycValidationException(
                    "Rejection reason is required"
            );
        }

        SellerKyc sellerKyc =
                getSellerKyc(sellerId);

        if (sellerKyc.getStatus() ==
                KycStatus.VERIFIED) {

            throw new AdminSellerKycStateException(
                    "Verified KYC cannot be rejected"
            );
        }

        if (sellerKyc.getStatus() ==
                KycStatus.REJECTED) {

            throw new AdminSellerKycStateException(
                    "KYC is already rejected"
            );
        }

        sellerKyc.setStatus(
                KycStatus.REJECTED
        );

        sellerKyc.setRejectionReason(
                rejectionReason.trim()
        );

        sellerKyc.setReviewedAt(
                LocalDateTime.now()
        );

        sellerKyc.setReviewedBy(
                adminUserId
        );

        sellerKycRepository.save(
                sellerKyc
        );
    }

    // =========================================================
    // GET SELLER KYC
    // =========================================================

    private SellerKyc getSellerKyc(
            Long sellerId
    ) {

        if (sellerId == null ||
                sellerId <= 0) {

            throw new AdminSellerKycValidationException(
                    "Invalid seller id"
            );
        }

        return sellerKycRepository
                .findBySellerId(sellerId)
                .orElseThrow(() ->
                        new AdminSellerKycNotFoundException(
                                "KYC not found for seller id: "
                                        + sellerId
                        )
                );
    }

    // =========================================================
    // VALIDATE IDS
    // =========================================================

    private void validateIds(
            Long sellerId,
            Long adminUserId
    ) {

        if (sellerId == null ||
                sellerId <= 0) {

            throw new AdminSellerKycValidationException(
                    "Invalid seller id"
            );
        }

        if (adminUserId == null ||
                adminUserId <= 0) {

            throw new AdminSellerKycValidationException(
                    "Invalid admin user id"
            );
        }
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private SellerKycResponse mapToResponse(
            SellerKyc sellerKyc
    ) {

        return SellerKycResponse.builder()
                .id(
                        sellerKyc.getId()
                )
                .sellerId(
                        sellerKyc.getSeller().getId()
                )
                .businessType(
                        sellerKyc.getBusinessType()
                )
                .gstNumber(
                        sellerKyc.getGstNumber()
                )
                .gstDocumentUrl(
                        sellerKyc.getGstDocumentUrl()
                )
                .registrationNumber(
                        sellerKyc.getRegistrationNumber()
                )
                .registrationDocumentUrl(
                        sellerKyc.getRegistrationDocumentUrl()
                )
                .ownerName(
                        sellerKyc.getOwnerName()
                )
                .panNumber(
                        sellerKyc.getPanNumber()
                )
                .panDocumentUrl(
                        sellerKyc.getPanDocumentUrl()
                )
                .aadhaarNumber(
                        maskAadhaar(
                                sellerKyc.getAadhaarNumber()
                        )
                )
                .aadhaarDocumentUrl(
                        sellerKyc.getAadhaarDocumentUrl()
                )
                .businessAddress(
                        sellerKyc.getBusinessAddress()
                )
                .city(
                        sellerKyc.getCity()
                )
                .state(
                        sellerKyc.getState()
                )
                .postalCode(
                        sellerKyc.getPostalCode()
                )
                .country(
                        sellerKyc.getCountry()
                )
                .addressDocumentUrl(
                        sellerKyc.getAddressDocumentUrl()
                )
                .status(
                        sellerKyc.getStatus()
                )
                .rejectionReason(
                        sellerKyc.getRejectionReason()
                )
                .submittedAt(
                        sellerKyc.getSubmittedAt()
                )
                .reviewedAt(
                        sellerKyc.getReviewedAt()
                )
                .reviewedBy(
                        sellerKyc.getReviewedBy()
                )
                .createdAt(
                        sellerKyc.getCreatedAt()
                )
                .updatedAt(
                        sellerKyc.getUpdatedAt()
                )
                .build();
    }

    // =========================================================
    // MASK AADHAAR
    // =========================================================

    private String maskAadhaar(
            String aadhaarNumber
    ) {

        if (aadhaarNumber == null ||
                aadhaarNumber.isBlank()) {

            return null;
        }

        String digits =
                aadhaarNumber.replaceAll(
                        "\\D",
                        ""
                );

        if (digits.length() != 12) {
            return "XXXX-XXXX-XXXX";
        }

        return "XXXX-XXXX-"
                + digits.substring(8);
    }
}