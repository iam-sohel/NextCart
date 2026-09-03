package com.nextcart.nextcart.seller_module.service;

import com.nextcart.nextcart.seller_module.dto.SellerBankAccountRequest;
import com.nextcart.nextcart.seller_module.dto.SellerBankAccountResponse;
import com.nextcart.nextcart.seller_module.dto.SellerKycRequest;
import com.nextcart.nextcart.seller_module.dto.SellerKycResponse;
import com.nextcart.nextcart.seller_module.dto.SellerResponse;
import com.nextcart.nextcart.seller_module.entity.BankVerificationStatus;
import com.nextcart.nextcart.seller_module.entity.KycStatus;
import com.nextcart.nextcart.seller_module.entity.Seller;
import com.nextcart.nextcart.seller_module.entity.SellerBankAccount;
import com.nextcart.nextcart.seller_module.entity.SellerKyc;
import com.nextcart.nextcart.seller_module.entity.SellerBankAccountRepository;
import com.nextcart.nextcart.seller_module.entity.SellerKycRepository;
import com.nextcart.nextcart.seller_module.entity.SellerRepository;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerServiceImpl implements SellerService {

    private static final long MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

    private final SellerRepository sellerRepository;
    private final SellerKycRepository sellerKycRepository;
    private final SellerBankAccountRepository sellerBankAccountRepository;
    private final UserRepository userRepository;

    @Value("${app.storage.seller-kyc-dir:uploads/seller-kyc}")
    private String kycStorageDirectory;

    @Override
    @Transactional(readOnly = true)
    public SellerResponse getMySellerProfile(String email) {

        Seller seller = getSellerByEmail(email);
        User user = seller.getUser();

        return SellerResponse.builder()
                .id(seller.getId())
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .businessName(seller.getBusinessName())
                .gstNumber(seller.getGstNumber())
                .verified(seller.isVerified())
                .active(seller.isActive())
                .build();
    }

    @Override
    public SellerKycResponse submitKyc(
            String email,
            SellerKycRequest request
    ) {

        Seller seller = getSellerByEmail(email);

        if (!seller.isActive()) {
            throw new IllegalStateException(
                    "Seller account is inactive"
            );
        }

        String panNumber = normalizeUpperCase(request.getPanNumber());
        String gstNumber = normalizeUpperCase(request.getGstNumber());

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(seller.getId())
                .orElseGet(() -> SellerKyc.builder()
                        .seller(seller)
                        .build());

        if (panNumber != null
                && !panNumber.equalsIgnoreCase(kyc.getPanNumber())
                && sellerKycRepository.existsByPanNumberIgnoreCase(panNumber)) {

            throw new IllegalArgumentException(
                    "PAN number is already registered"
            );
        }

        if (gstNumber != null
                && !gstNumber.equalsIgnoreCase(kyc.getGstNumber())
                && sellerKycRepository.existsByGstNumberIgnoreCase(gstNumber)) {

            throw new IllegalArgumentException(
                    "GST number is already registered"
            );
        }

        kyc.setPanNumber(panNumber);
        kyc.setGstNumber(gstNumber);

        /*
         * Full Aadhaar number is never persisted.
         * Only the last four digits are retained.
         */
        if (request.getAadhaarNumber() != null
                && !request.getAadhaarNumber().isBlank()) {

            String aadhaar = request.getAadhaarNumber().trim();

            if (!aadhaar.matches("^\\d{12}$")) {
                throw new IllegalArgumentException(
                        "Invalid Aadhaar number"
                );
            }

            kyc.setAadhaarLastFour(
                    aadhaar.substring(aadhaar.length() - 4)
            );
        }

        /*
         * Upload documents if supplied.
         */
        if (request.getPanDocument() != null
                && !request.getPanDocument().isEmpty()) {

            kyc.setPanDocumentPath(
                    storePdf(
                            request.getPanDocument(),
                            seller.getId(),
                            "pan"
                    )
            );
        }

        if (request.getAadhaarDocument() != null
                && !request.getAadhaarDocument().isEmpty()) {

            kyc.setAadhaarDocumentPath(
                    storePdf(
                            request.getAadhaarDocument(),
                            seller.getId(),
                            "aadhaar"
                    )
            );
        }

        if (request.getGstDocument() != null
                && !request.getGstDocument().isEmpty()) {

            kyc.setGstDocumentPath(
                    storePdf(
                            request.getGstDocument(),
                            seller.getId(),
                            "gst"
                    )
            );
        }

        /*
         * Every new/updated KYC submission requires review again.
         */
        kyc.setStatus(KycStatus.PENDING);
        kyc.setRejectionReason(null);
        kyc.setVerifiedAt(null);

        SellerKyc savedKyc = sellerKycRepository.save(kyc);

        return toKycResponse(savedKyc);
    }

    @Override
    @Transactional(readOnly = true)
    public SellerKycResponse getMyKyc(String email) {

        Seller seller = getSellerByEmail(email);

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(seller.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller KYC details not found"
                        )
                );

        return toKycResponse(kyc);
    }

    @Override
    public SellerBankAccountResponse addBankAccount(
            String email,
            SellerBankAccountRequest request
    ) {

        Seller seller = getSellerByEmail(email);

        if (!seller.isActive()) {
            throw new IllegalStateException(
                    "Seller account is inactive"
            );
        }

        SellerBankAccount bankAccount = sellerBankAccountRepository
                .findBySellerId(seller.getId())
                .orElseGet(() -> SellerBankAccount.builder()
                        .seller(seller)
                        .build());

        bankAccount.setAccountHolderName(
                request.getAccountHolderName().trim()
        );

        bankAccount.setAccountNumber(
                request.getAccountNumber().trim()
        );

        bankAccount.setIfscCode(
                request.getIfscCode().trim().toUpperCase()
        );

        bankAccount.setBankName(
                request.getBankName().trim()
        );

        /*
         * Any bank-account change requires verification again.
         */
        bankAccount.setVerificationStatus(
                BankVerificationStatus.PENDING
        );

        bankAccount.setActive(true);
        bankAccount.setVerifiedAt(null);

        SellerBankAccount saved =
                sellerBankAccountRepository.save(bankAccount);

        return toBankAccountResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SellerBankAccountResponse getMyBankAccount(String email) {

        Seller seller = getSellerByEmail(email);

        SellerBankAccount bankAccount =
                sellerBankAccountRepository
                        .findBySellerId(seller.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Seller bank account not found"
                                )
                        );

        return toBankAccountResponse(bankAccount);
    }

    @Override
    public void updateKycDocuments(
            String email,
            MultipartFile panDocument,
            MultipartFile aadhaarDocument,
            MultipartFile gstDocument
    ) {

        Seller seller = getSellerByEmail(email);

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(seller.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller KYC details not found"
                        )
                );

        if (panDocument != null && !panDocument.isEmpty()) {
            kyc.setPanDocumentPath(
                    storePdf(
                            panDocument,
                            seller.getId(),
                            "pan"
                    )
            );
        }

        if (aadhaarDocument != null && !aadhaarDocument.isEmpty()) {
            kyc.setAadhaarDocumentPath(
                    storePdf(
                            aadhaarDocument,
                            seller.getId(),
                            "aadhaar"
                    )
            );
        }

        if (gstDocument != null && !gstDocument.isEmpty()) {
            kyc.setGstDocumentPath(
                    storePdf(
                            gstDocument,
                            seller.getId(),
                            "gst"
                    )
            );
        }

        /*
         * Document changes send KYC back to review.
         */
        kyc.setStatus(KycStatus.PENDING);
        kyc.setRejectionReason(null);
        kyc.setVerifiedAt(null);

        sellerKycRepository.save(kyc);
    }

    private Seller getSellerByEmail(String email) {

        User user = userRepository
                .findByEmailIgnoreCase(email.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        return sellerRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller profile not found"
                        )
                );
    }

    private SellerKycResponse toKycResponse(SellerKyc kyc) {

        return SellerKycResponse.builder()
                .id(kyc.getId())
                .sellerId(kyc.getSeller().getId())
                .panNumber(maskPan(kyc.getPanNumber()))
                .aadhaarLastFour(kyc.getAadhaarLastFour())
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

    private SellerBankAccountResponse toBankAccountResponse(
            SellerBankAccount bankAccount
    ) {

        return SellerBankAccountResponse.builder()
                .id(bankAccount.getId())
                .sellerId(bankAccount.getSeller().getId())
                .accountHolderName(
                        bankAccount.getAccountHolderName()
                )
                .maskedAccountNumber(
                        maskAccountNumber(
                                bankAccount.getAccountNumber()
                        )
                )
                .ifscCode(bankAccount.getIfscCode())
                .bankName(bankAccount.getBankName())
                .verificationStatus(
                        bankAccount.getVerificationStatus()
                )
                .active(bankAccount.isActive())
                .verifiedAt(bankAccount.getVerifiedAt())
                .createdAt(bankAccount.getCreatedAt())
                .updatedAt(bankAccount.getUpdatedAt())
                .build();
    }

    private String storePdf(
            MultipartFile file,
            Long sellerId,
            String documentType
    ) {

        validatePdf(file);

        try {

            Path sellerDirectory = Paths.get(
                    kycStorageDirectory,
                    String.valueOf(sellerId)
            );

            Files.createDirectories(sellerDirectory);

            String fileName =
                    documentType
                            + "_"
                            + UUID.randomUUID()
                            + ".pdf";

            Path destination =
                    sellerDirectory.resolve(fileName)
                            .normalize();

            if (!destination.startsWith(
                    sellerDirectory.toAbsolutePath().normalize()
            )) {
                throw new IllegalArgumentException(
                        "Invalid document path"
                );
            }

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return destination.toString();

        } catch (IOException ex) {

            throw new IllegalStateException(
                    "Failed to store KYC document",
                    ex
            );
        }
    }

    private void validatePdf(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "KYC document is required"
            );
        }

        if (file.getSize() > MAX_DOCUMENT_SIZE) {
            throw new IllegalArgumentException(
                    "KYC document must not exceed 5 MB"
            );
        }

        String contentType = file.getContentType();

        if (!"application/pdf".equalsIgnoreCase(contentType)) {
            throw new IllegalArgumentException(
                    "Only PDF documents are allowed"
            );
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null
                || !originalFilename
                .toLowerCase()
                .endsWith(".pdf")) {

            throw new IllegalArgumentException(
                    "Only PDF documents are allowed"
            );
        }
    }

    private String normalizeUpperCase(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toUpperCase();
    }

    private String maskPan(String pan) {

        if (pan == null || pan.length() != 10) {
            return pan;
        }

        return pan.substring(0, 5)
                + "****"
                + pan.substring(9);
    }

    private String maskAccountNumber(String accountNumber) {

        if (accountNumber == null
                || accountNumber.length() <= 4) {

            return "****";
        }

        return "******"
                + accountNumber.substring(
                        accountNumber.length() - 4
                );
    }
}