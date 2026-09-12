package com.nextcart.nextcart.seller_module.sellerKyc.service;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycRequest;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycResponse;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.KycStatus;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.SellerKyc;
import com.nextcart.nextcart.seller_module.sellerKyc.repository.SellerKycRepository;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerKycServiceImpl implements SellerKycService {

    private final SellerRepository sellerRepository;
    private final SellerKycRepository sellerKycRepository;

    // =========================================================
    // SUBMIT KYC
    // =========================================================

    @Override
    public SellerKycResponse submitKyc(
            Long userId,
            SellerKycRequest request
    ) {

        Seller seller = getSellerByUserId(userId);

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(seller.getId())
                .orElse(null);

        /*
         * A verified KYC cannot be directly modified.
         */
        if (kyc != null && kyc.getStatus() == KycStatus.VERIFIED) {
            throw new IllegalStateException(
                    "KYC is already verified and cannot be modified"
            );
        }

        if (kyc == null) {

            kyc = SellerKyc.builder()
                    .seller(seller)
                    .panNumber(request.getPanNumber())
                    .aadhaarNumber(request.getAadhaarNumber())
                    .gstNumber(request.getGstNumber())
                    .status(KycStatus.PENDING)
                    .build();

        } else {

            kyc.setPanNumber(request.getPanNumber());
            kyc.setAadhaarNumber(request.getAadhaarNumber());
            kyc.setGstNumber(request.getGstNumber());

            /*
             * Resubmission starts a new review cycle.
             */
            kyc.setStatus(KycStatus.PENDING);
            kyc.setRejectionReason(null);
            kyc.setVerifiedAt(null);
        }

        SellerKyc savedKyc = sellerKycRepository.save(kyc);

        return mapToResponse(savedKyc);
    }

    // =========================================================
    // GET MY KYC
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerKycResponse getMyKyc(Long userId) {

        Seller seller = getSellerByUserId(userId);

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(seller.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "KYC details not found"
                        )
                );

        return mapToResponse(kyc);
    }

    // =========================================================
    // UPDATE KYC
    // =========================================================

    @Override
    public SellerKycResponse updateKyc(
            Long userId,
            SellerKycRequest request
    ) {

        Seller seller = getSellerByUserId(userId);

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(seller.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "KYC details not found"
                        )
                );

        if (kyc.getStatus() == KycStatus.VERIFIED) {
            throw new IllegalStateException(
                    "Verified KYC cannot be modified"
            );
        }

        kyc.setPanNumber(request.getPanNumber());
        kyc.setAadhaarNumber(request.getAadhaarNumber());
        kyc.setGstNumber(request.getGstNumber());

        /*
         * Any modification requires fresh Admin verification.
         */
        kyc.setStatus(KycStatus.PENDING);
        kyc.setRejectionReason(null);
        kyc.setVerifiedAt(null);

        SellerKyc updatedKyc =
                sellerKycRepository.save(kyc);

        return mapToResponse(updatedKyc);
    }

    // =========================================================
    // UPLOAD KYC DOCUMENTS
    // =========================================================

    @Override
    public SellerKycResponse uploadKycDocuments(
            Long userId,
            MultipartFile panDocument,
            MultipartFile aadhaarDocument,
            MultipartFile gstDocument
    ) {

        Seller seller = getSellerByUserId(userId);

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(seller.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Submit KYC details before uploading documents"
                        )
                );

        if (kyc.getStatus() == KycStatus.VERIFIED) {
            throw new IllegalStateException(
                    "Verified KYC documents cannot be modified"
            );
        }

        if (panDocument != null && !panDocument.isEmpty()) {

            validatePdf(panDocument);

            String path = uploadDocument(
                    panDocument,
                    seller.getId(),
                    "PAN"
            );

            kyc.setPanDocumentPath(path);
        }

        if (aadhaarDocument != null && !aadhaarDocument.isEmpty()) {

            validatePdf(aadhaarDocument);

            String path = uploadDocument(
                    aadhaarDocument,
                    seller.getId(),
                    "AADHAAR"
            );

            kyc.setAadhaarDocumentPath(path);
        }

        if (gstDocument != null && !gstDocument.isEmpty()) {

            validatePdf(gstDocument);

            String path = uploadDocument(
                    gstDocument,
                    seller.getId(),
                    "GST"
            );

            kyc.setGstDocumentPath(path);
        }

        /*
         * Uploading/changing documents requires Admin review.
         */
        kyc.setStatus(KycStatus.PENDING);
        kyc.setRejectionReason(null);
        kyc.setVerifiedAt(null);

        SellerKyc savedKyc =
                sellerKycRepository.save(kyc);

        return mapToResponse(savedKyc);
    }

    // =========================================================
    // FIND SELLER
    // =========================================================

    private Seller getSellerByUserId(Long userId) {

        return sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller profile not found"
                        )
                );
    }

    // =========================================================
    // PDF VALIDATION
    // =========================================================

    private void validatePdf(MultipartFile file) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Document cannot be empty"
            );
        }

        if (!"application/pdf".equalsIgnoreCase(
                file.getContentType()
        )) {
            throw new IllegalArgumentException(
                    "Only PDF documents are allowed"
            );
        }

        long maxFileSize = 5L * 1024 * 1024;

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                    "Document size must not exceed 5 MB"
            );
        }
    }

    // =========================================================
    // DOCUMENT STORAGE
    // =========================================================

    private String uploadDocument(
            MultipartFile file,
            Long sellerId,
            String documentType
    ) {

        /*
         * Replace this with your actual storage service.
         *
         * Example:
         * S3 / Supabase Storage / Azure Blob Storage
         *
         * Do not store PDF bytes directly in the database.
         */

        return "kyc/seller/"
                + sellerId
                + "/"
                + documentType.toLowerCase()
                + "/"
                + file.getOriginalFilename();
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private SellerKycResponse mapToResponse(
            SellerKyc kyc
    ) {

        return SellerKycResponse.builder()
                .id(kyc.getId())
                .sellerId(kyc.getSeller().getId())
                .panNumber(kyc.getPanNumber())
                .maskedAadhaarNumber(
                        maskAadhaar(kyc.getAadhaarNumber())
                )
                .gstNumber(kyc.getGstNumber())
                .panDocumentUploaded(
                        kyc.getPanDocumentPath() != null
                )
                .aadhaarDocumentUploaded(
                        kyc.getAadhaarDocumentPath() != null
                )
                .gstDocumentUploaded(
                        kyc.getGstDocumentPath() != null
                )
                .status(kyc.getStatus())
                .rejectionReason(kyc.getRejectionReason())
                .verifiedAt(kyc.getVerifiedAt())
                .createdAt(kyc.getCreatedAt())
                .updatedAt(kyc.getUpdatedAt())
                .build();
    }

    // =========================================================
    // MASK AADHAAR
    // =========================================================

    private String maskAadhaar(String aadhaarNumber) {

        if (aadhaarNumber == null ||
                aadhaarNumber.length() != 12) {
            return null;
        }

        return "XXXX-XXXX-"
                + aadhaarNumber.substring(8);
    }
}