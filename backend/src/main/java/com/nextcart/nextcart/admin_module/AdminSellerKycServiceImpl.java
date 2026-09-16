package com.nextcart.nextcart.admin_module;

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
public class AdminSellerKycServiceImpl implements AdminSellerKycService {

    private final SellerKycRepository sellerKycRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<SellerKycResponse> getAllKyc(Pageable pageable) {
        return sellerKycRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SellerKycResponse> getPendingKyc(Pageable pageable) {
        return sellerKycRepository
                .findAllByStatus(KycStatus.PENDING, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SellerKycResponse getKycBySellerId(Long sellerId) {
        SellerKyc sellerKyc = getSellerKyc(sellerId);
        return mapToResponse(sellerKyc);
    }

    @Override
    public void approveKyc(Long sellerId, Long adminUserId) {

        SellerKyc sellerKyc = getSellerKyc(sellerId);

        if (sellerKyc.getStatus() == KycStatus.VERIFIED) {
            return;
        }

        sellerKyc.setStatus(KycStatus.VERIFIED);
        sellerKyc.setRejectionReason(null);
        sellerKyc.setReviewedAt(LocalDateTime.now());
        sellerKyc.setReviewedBy(adminUserId);

        sellerKycRepository.save(sellerKyc);
    }

    @Override
    public void rejectKyc(
            Long sellerId,
            Long adminUserId,
            String rejectionReason) {

        SellerKyc sellerKyc = getSellerKyc(sellerId);

        sellerKyc.setStatus(KycStatus.REJECTED);
        sellerKyc.setRejectionReason(rejectionReason);
        sellerKyc.setReviewedAt(LocalDateTime.now());
        sellerKyc.setReviewedBy(adminUserId);

        sellerKycRepository.save(sellerKyc);
    }

    private SellerKyc getSellerKyc(Long sellerId) {
        return sellerKycRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new RuntimeException(
                        "KYC not found for seller id: " + sellerId
                ));
    }

    private SellerKycResponse mapToResponse(SellerKyc sellerKyc) {

        return SellerKycResponse.builder()
                .id(sellerKyc.getId())
                .sellerId(sellerKyc.getSeller().getId())
                .businessType(sellerKyc.getBusinessType())
                .gstNumber(sellerKyc.getGstNumber())
                .gstDocumentUrl(sellerKyc.getGstDocumentUrl())
                .registrationNumber(sellerKyc.getRegistrationNumber())
                .registrationDocumentUrl(
                        sellerKyc.getRegistrationDocumentUrl()
                )
                .ownerName(sellerKyc.getOwnerName())
                .panNumber(sellerKyc.getPanNumber())
                .panDocumentUrl(sellerKyc.getPanDocumentUrl())
                .aadhaarNumber(maskAadhaar(
                        sellerKyc.getAadhaarNumber()
                ))
                .aadhaarDocumentUrl(
                        sellerKyc.getAadhaarDocumentUrl()
                )
                .businessAddress(sellerKyc.getBusinessAddress())
                .city(sellerKyc.getCity())
                .state(sellerKyc.getState())
                .postalCode(sellerKyc.getPostalCode())
                .country(sellerKyc.getCountry())
                .addressDocumentUrl(
                        sellerKyc.getAddressDocumentUrl()
                )
                .status(sellerKyc.getStatus())
                .rejectionReason(sellerKyc.getRejectionReason())
                .submittedAt(sellerKyc.getSubmittedAt())
                .reviewedAt(sellerKyc.getReviewedAt())
                .reviewedBy(sellerKyc.getReviewedBy())
                .createdAt(sellerKyc.getCreatedAt())
                .updatedAt(sellerKyc.getUpdatedAt())
                .build();
    }

    private String maskAadhaar(String aadhaarNumber) {

        if (aadhaarNumber == null || aadhaarNumber.isBlank()) {
            return null;
        }

        String digits = aadhaarNumber.replaceAll("\\D", "");

        if (digits.length() != 12) {
            return "XXXX-XXXX-XXXX";
        }

        return "XXXX-XXXX-" + digits.substring(8);
    }
}