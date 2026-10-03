package com.gesmio.havlook.seller_module.sellerKyc.service;

import com.gesmio.havlook.seller_module.seller.entity.Seller;
import com.gesmio.havlook.seller_module.seller.repository.SellerRepository;
import com.gesmio.havlook.seller_module.sellerKyc.dto.SellerKycRequest;
import com.gesmio.havlook.seller_module.sellerKyc.dto.SellerKycResponse;
import com.gesmio.havlook.seller_module.sellerKyc.entity.KycStatus;
import com.gesmio.havlook.seller_module.sellerKyc.entity.SellerKyc;
import com.gesmio.havlook.seller_module.sellerKyc.exception.SellerKycDocumentUploadException;
import com.gesmio.havlook.seller_module.sellerKyc.exception.SellerKycNotFoundException;
import com.gesmio.havlook.seller_module.sellerKyc.exception.SellerKycStateException;
import com.gesmio.havlook.seller_module.sellerKyc.exception.SellerKycValidationException;
import com.gesmio.havlook.seller_module.sellerKyc.repository.SellerKycRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerKycServiceImpl implements SellerKycService {

    private final SellerRepository sellerRepository;

    private final SellerKycRepository sellerKycRepository;

    /*
     * Used for Supabase Storage API calls.
     */
    private final RestTemplate restTemplate = new RestTemplate();

    // =========================================================
    // SUPABASE CONFIGURATION
    // =========================================================

    @Value("${supabase.url}")
    private String supabaseUrl;

    /*
     * New Supabase secret key.
     *
     * Example:
     * sb_secret_...
     *
     * This key is sent using the "apikey" header.
     */
    @Value("${supabase.service-role-key}")
    private String supabaseSecretKey;

    /*
     * Legacy Supabase service_role JWT.
     *
     * This key is sent using:
     *
     * Authorization: Bearer <JWT>
     */
    @Value("${supabase.storage-authorization-key}")
    private String supabaseStorageAuthorizationKey;

    @Value("${supabase.kyc-bucket:seller-kyc}")
    private String kycBucket;

    // =========================================================
    // CONSTANTS
    // =========================================================

    /**
     * Maximum allowed size for each KYC PDF.
     *
     * 2 MB = 2 * 1024 * 1024 bytes
     */
    private static final long MAX_FILE_SIZE =
            2L * 1024L * 1024L;

    // =========================================================
    // SUBMIT KYC
    // =========================================================

    @Override
    public SellerKycResponse submitKyc(
            Long userId,
            SellerKycRequest request
    ) {

        if (request == null) {

            throw new SellerKycValidationException(
                    "KYC request is required"
            );
        }

        Seller seller =
                getSellerByUserId(userId);

        SellerKyc kyc =
                sellerKycRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElse(null);

        // -----------------------------------------------------
        // VERIFIED KYC CANNOT BE MODIFIED
        // -----------------------------------------------------

        if (kyc != null &&
                kyc.getStatus() == KycStatus.VERIFIED) {

            throw new SellerKycStateException(
                    "KYC is already verified and cannot be modified"
            );
        }

        // -----------------------------------------------------
        // CREATE NEW KYC
        // -----------------------------------------------------

        if (kyc == null) {

            kyc = SellerKyc.builder()

                    .seller(seller)

                    .businessType(
                            request.getBusinessType()
                    )

                    .gstNumber(
                            normalize(
                                    request.getGstNumber()
                            )
                    )

                    .registrationNumber(
                            normalize(
                                    request.getRegistrationNumber()
                            )
                    )

                    .ownerName(
                            normalize(
                                    request.getOwnerName()
                            )
                    )

                    .dateOfBirth(
                            request.getDateOfBirth()
                    )

                    .panNumber(
                            normalizeUpper(
                                    request.getPanNumber()
                            )
                    )

                    .aadhaarNumber(
                            normalize(
                                    request.getAadhaarNumber()
                            )
                    )

                    .businessAddress(
                            normalize(
                                    request.getBusinessAddress()
                            )
                    )

                    .city(
                            normalize(
                                    request.getCity()
                            )
                    )

                    .state(
                            normalize(
                                    request.getState()
                            )
                    )

                    .postalCode(
                            normalize(
                                    request.getPostalCode()
                            )
                    )

                    .country(
                            getCountry(
                                    request.getCountry()
                            )
                    )

                    .status(
                            KycStatus.PENDING
                    )

                    .submittedAt(
                            LocalDateTime.now()
                    )

                    .build();

        } else {

            // -------------------------------------------------
            // UPDATE EXISTING KYC
            // -------------------------------------------------

            kyc.setBusinessType(
                    request.getBusinessType()
            );

            kyc.setGstNumber(
                    normalize(
                            request.getGstNumber()
                    )
            );

            kyc.setRegistrationNumber(
                    normalize(
                            request.getRegistrationNumber()
                    )
            );

            kyc.setOwnerName(
                    normalize(
                            request.getOwnerName()
                    )
            );

            kyc.setDateOfBirth(
                    request.getDateOfBirth()
            );

            kyc.setPanNumber(
                    normalizeUpper(
                            request.getPanNumber()
                    )
            );

            kyc.setAadhaarNumber(
                    normalize(
                            request.getAadhaarNumber()
                    )
            );

            kyc.setBusinessAddress(
                    normalize(
                            request.getBusinessAddress()
                    )
            );

            kyc.setCity(
                    normalize(
                            request.getCity()
                    )
            );

            kyc.setState(
                    normalize(
                            request.getState()
                    )
            );

            kyc.setPostalCode(
                    normalize(
                            request.getPostalCode()
                    )
            );

            kyc.setCountry(
                    getCountry(
                            request.getCountry()
                    )
            );

            // -------------------------------------------------
            // NEW REVIEW CYCLE
            // -------------------------------------------------

            kyc.setStatus(
                    KycStatus.PENDING
            );

            kyc.setRejectionReason(null);

            kyc.setReviewedAt(null);

            kyc.setReviewedBy(null);

            kyc.setSubmittedAt(
                    LocalDateTime.now()
            );
        }

        SellerKyc savedKyc =
                sellerKycRepository.save(kyc);

        return mapToResponse(savedKyc);
    }

    // =========================================================
    // GET MY KYC
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerKycResponse getMyKyc(
            Long userId
    ) {

        Seller seller =
                getSellerByUserId(userId);

        SellerKyc kyc =
                sellerKycRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElseThrow(() ->
                                new SellerKycNotFoundException(
                                        "KYC details not found"
                                )
                        );

        return mapToResponse(kyc);
    }

    // =========================================================
    // GET KYC STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerKycResponse getKycStatus(
            Long userId
    ) {

        Seller seller =
                getSellerByUserId(userId);

        SellerKyc kyc =
                sellerKycRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElseThrow(() ->
                                new SellerKycNotFoundException(
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

        if (request == null) {

            throw new SellerKycValidationException(
                    "KYC update request is required"
            );
        }

        Seller seller =
                getSellerByUserId(userId);

        SellerKyc kyc =
                sellerKycRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElseThrow(() ->
                                new SellerKycNotFoundException(
                                        "KYC details not found"
                                )
                        );

        // -----------------------------------------------------
        // VERIFIED KYC CANNOT BE MODIFIED
        // -----------------------------------------------------

        if (kyc.getStatus() == KycStatus.VERIFIED) {

            throw new SellerKycStateException(
                    "Verified KYC cannot be modified"
            );
        }

        // -----------------------------------------------------
        // UPDATE DETAILS
        // -----------------------------------------------------

        kyc.setBusinessType(
                request.getBusinessType()
        );

        kyc.setGstNumber(
                normalize(
                        request.getGstNumber()
                )
        );

        kyc.setRegistrationNumber(
                normalize(
                        request.getRegistrationNumber()
                )
        );

        kyc.setOwnerName(
                normalize(
                        request.getOwnerName()
                )
        );

        kyc.setDateOfBirth(
                request.getDateOfBirth()
        );

        kyc.setPanNumber(
                normalizeUpper(
                        request.getPanNumber()
                )
        );

        kyc.setAadhaarNumber(
                normalize(
                        request.getAadhaarNumber()
                )
        );

        kyc.setBusinessAddress(
                normalize(
                        request.getBusinessAddress()
                )
        );

        kyc.setCity(
                normalize(
                        request.getCity()
                )
        );

        kyc.setState(
                normalize(
                        request.getState()
                )
        );

        kyc.setPostalCode(
                normalize(
                        request.getPostalCode()
                )
        );

        kyc.setCountry(
                getCountry(
                        request.getCountry()
                )
        );

        // -----------------------------------------------------
        // NEW REVIEW REQUIRED
        // -----------------------------------------------------

        kyc.setStatus(
                KycStatus.PENDING
        );

        kyc.setRejectionReason(null);

        kyc.setReviewedAt(null);

        kyc.setReviewedBy(null);

        kyc.setSubmittedAt(
                LocalDateTime.now()
        );

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
            MultipartFile gstDocument,
            MultipartFile registrationDocument,
            MultipartFile addressDocument
    ) {

        Seller seller =
                getSellerByUserId(userId);

        SellerKyc kyc =
                sellerKycRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElseThrow(() ->
                                new SellerKycValidationException(
                                        "Submit KYC details before uploading documents"
                                )
                        );

        // -----------------------------------------------------
        // VERIFIED KYC CANNOT BE MODIFIED
        // -----------------------------------------------------

        if (kyc.getStatus() == KycStatus.VERIFIED) {

            throw new SellerKycStateException(
                    "Verified KYC documents cannot be modified"
            );
        }

        // -----------------------------------------------------
        // CHECK AT LEAST ONE DOCUMENT
        // -----------------------------------------------------

        if (!hasFile(panDocument)
                && !hasFile(aadhaarDocument)
                && !hasFile(gstDocument)
                && !hasFile(registrationDocument)
                && !hasFile(addressDocument)) {

            throw new SellerKycValidationException(
                    "At least one KYC document is required"
            );
        }

        // -----------------------------------------------------
        // PAN DOCUMENT
        // -----------------------------------------------------

        if (hasFile(panDocument)) {

            validatePdf(panDocument);

            String url =
                    uploadToSupabase(
                            panDocument,
                            seller.getId(),
                            "pan"
                    );

            kyc.setPanDocumentUrl(url);
        }

        // -----------------------------------------------------
        // AADHAAR DOCUMENT
        // -----------------------------------------------------

        if (hasFile(aadhaarDocument)) {

            validatePdf(aadhaarDocument);

            String url =
                    uploadToSupabase(
                            aadhaarDocument,
                            seller.getId(),
                            "aadhaar"
                    );

            kyc.setAadhaarDocumentUrl(url);
        }

        // -----------------------------------------------------
        // GST DOCUMENT
        // -----------------------------------------------------

        if (hasFile(gstDocument)) {

            validatePdf(gstDocument);

            String url =
                    uploadToSupabase(
                            gstDocument,
                            seller.getId(),
                            "gst"
                    );

            kyc.setGstDocumentUrl(url);
        }

        // -----------------------------------------------------
        // REGISTRATION DOCUMENT
        // -----------------------------------------------------

        if (hasFile(registrationDocument)) {

            validatePdf(registrationDocument);

            String url =
                    uploadToSupabase(
                            registrationDocument,
                            seller.getId(),
                            "registration"
                    );

            kyc.setRegistrationDocumentUrl(url);
        }

        // -----------------------------------------------------
        // ADDRESS DOCUMENT
        // -----------------------------------------------------

        if (hasFile(addressDocument)) {

            validatePdf(addressDocument);

            String url =
                    uploadToSupabase(
                            addressDocument,
                            seller.getId(),
                            "address"
                    );

            kyc.setAddressDocumentUrl(url);
        }

        // -----------------------------------------------------
        // NEW REVIEW CYCLE
        // -----------------------------------------------------

        kyc.setStatus(
                KycStatus.PENDING
        );

        kyc.setRejectionReason(null);

        kyc.setReviewedAt(null);

        kyc.setReviewedBy(null);

        kyc.setSubmittedAt(
                LocalDateTime.now()
        );

        SellerKyc savedKyc =
                sellerKycRepository.save(kyc);

        return mapToResponse(savedKyc);
    }

    // =========================================================
    // FIND SELLER BY USER ID
    // =========================================================

    private Seller getSellerByUserId(
            Long userId
    ) {

        if (userId == null || userId <= 0) {

            throw new SellerKycValidationException(
                    "Valid user ID is required"
            );
        }

        return sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new SellerKycValidationException(
                                "Seller profile not found"
                        )
                );
    }

    // =========================================================
    // PDF VALIDATION
    // =========================================================

    private void validatePdf(
            MultipartFile file
    ) {

        if (file == null ||
                file.isEmpty()) {

            throw new SellerKycValidationException(
                    "Document cannot be empty"
            );
        }

        // -----------------------------------------------------
        // SIZE
        // -----------------------------------------------------

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new SellerKycValidationException(
                    "Document size must not exceed 2 MB"
            );
        }

        // -----------------------------------------------------
        // CONTENT TYPE
        // -----------------------------------------------------

        String contentType =
                file.getContentType();

        if (!MediaType.APPLICATION_PDF_VALUE
                .equalsIgnoreCase(contentType)) {

            throw new SellerKycValidationException(
                    "Only PDF documents are allowed"
            );
        }

        // -----------------------------------------------------
        // FILE EXTENSION
        // -----------------------------------------------------

        String filename =
                file.getOriginalFilename();

        if (filename == null ||
                !filename
                        .toLowerCase(Locale.ROOT)
                        .endsWith(".pdf")) {

            throw new SellerKycValidationException(
                    "Only .pdf files are allowed"
            );
        }
    }

    // =========================================================
    // UPLOAD TO SUPABASE STORAGE
    // =========================================================

    private String uploadToSupabase(
            MultipartFile file,
            Long sellerId,
            String documentType
    ) {

        try {

            // -------------------------------------------------
            // VALIDATE SUPABASE CONFIG
            // -------------------------------------------------

            if (supabaseUrl == null ||
                    supabaseUrl.isBlank()) {

                throw new SellerKycDocumentUploadException(
                        "Supabase URL is not configured"
                );
            }

            if (supabaseSecretKey == null ||
                    supabaseSecretKey.isBlank()) {

                throw new SellerKycDocumentUploadException(
                        "Supabase secret key is not configured"
                );
            }

            if (supabaseStorageAuthorizationKey == null ||
                    supabaseStorageAuthorizationKey.isBlank()) {

                throw new SellerKycDocumentUploadException(
                        "Supabase storage authorization key is not configured"
                );
            }

            if (kycBucket == null ||
                    kycBucket.isBlank()) {

                throw new SellerKycDocumentUploadException(
                        "Supabase KYC bucket is not configured"
                );
            }

            // -------------------------------------------------
            // NORMALIZE CONFIG
            // -------------------------------------------------

            String baseUrl =
                    supabaseUrl.trim();

            while (baseUrl.endsWith("/")) {

                baseUrl =
                        baseUrl.substring(
                                0,
                                baseUrl.length() - 1
                        );
            }

            String bucket =
                    kycBucket.trim();

            String apiKey =
                    supabaseSecretKey.trim();

            String authorizationKey =
                    supabaseStorageAuthorizationKey.trim();

            // -------------------------------------------------
            // VALIDATE KEY TYPES
            // -------------------------------------------------

            if (!apiKey.startsWith("sb_secret_")) {

                throw new SellerKycDocumentUploadException(
                        "Invalid Supabase secret key configuration"
                );
            }

            if (!authorizationKey.startsWith("eyJ")) {

                throw new SellerKycDocumentUploadException(
                        "Invalid Supabase storage authorization key configuration"
                );
            }

            // -------------------------------------------------
            // UNIQUE FILE NAME
            // -------------------------------------------------

            String fileName =
                    UUID.randomUUID()
                            .toString()
                            + ".pdf";

            // -------------------------------------------------
            // STORAGE OBJECT PATH
            // -------------------------------------------------

            String objectPath =
                    sellerId
                            + "/"
                            + documentType
                            + "/"
                            + fileName;

            // -------------------------------------------------
            // SUPABASE STORAGE UPLOAD URL
            // -------------------------------------------------

            String uploadUrl =
                    baseUrl
                            + "/storage/v1/object/"
                            + bucket
                            + "/"
                            + objectPath;

            // -------------------------------------------------
            // HEADERS
            // -------------------------------------------------

            HttpHeaders headers =
                    new HttpHeaders();

            /*
             * New Supabase secret key.
             */
            headers.set(
                    "apikey",
                    apiKey
            );

            /*
             * Legacy service_role JWT.
             */
            headers.set(
                    "Authorization",
                    "Bearer " + authorizationKey
            );

            headers.setContentType(
                    MediaType.APPLICATION_PDF
            );

            headers.set(
                    "x-upsert",
                    "false"
            );

            // -------------------------------------------------
            // SAFE DEBUG
            // -------------------------------------------------

            System.out.println(
                    "========== SUPABASE STORAGE DEBUG =========="
            );

            System.out.println(
                    "Supabase URL : " + baseUrl
            );

            System.out.println(
                    "Bucket       : [" + bucket + "]"
            );

            System.out.println(
                    "API key type : "
                            + (
                            apiKey.startsWith("sb_secret_")
                                    ? "NEW SECRET KEY"
                                    : "UNKNOWN"
                    )
            );

            System.out.println(
                    "API key present : "
                            + !apiKey.isBlank()
            );

            System.out.println(
                    "API key length : "
                            + apiKey.length()
            );

            System.out.println(
                    "Authorization key present : "
                            + !authorizationKey.isBlank()
            );

            System.out.println(
                    "Authorization key JWT : "
                            + (
                            authorizationKey
                                    .split("\\.", -1)
                                    .length == 3
                    )
            );

            System.out.println(
                    "Object path  : " + objectPath
            );

            System.out.println(
                    "============================================"
            );

            // -------------------------------------------------
            // FILE BYTES
            // -------------------------------------------------

            byte[] fileBytes =
                    file.getBytes();

            // -------------------------------------------------
            // REQUEST
            // -------------------------------------------------

            HttpEntity<byte[]> request =
                    new HttpEntity<>(
                            fileBytes,
                            headers
                    );

            // -------------------------------------------------
            // UPLOAD
            // -------------------------------------------------

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            uploadUrl,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            // -------------------------------------------------
            // RESPONSE VALIDATION
            // -------------------------------------------------

            if (!response.getStatusCode()
                    .is2xxSuccessful()) {

                throw new SellerKycDocumentUploadException(
                        "Supabase upload failed. HTTP "
                                + response.getStatusCode().value()
                                + " - "
                                + response.getBody()
                );
            }

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            System.out.println(
                    "KYC document uploaded successfully"
            );

            System.out.println(
                    "Storage path : "
                            + objectPath
            );

            // -------------------------------------------------
            // RETURN STORAGE OBJECT URL
            // -------------------------------------------------

            return baseUrl
                    + "/storage/v1/object/"
                    + bucket
                    + "/"
                    + objectPath;

        } catch (HttpStatusCodeException e) {

            String responseBody =
                    e.getResponseBodyAsString();

            throw new SellerKycDocumentUploadException(
                    "Supabase upload failed. HTTP "
                            + e.getStatusCode().value()
                            + " - "
                            + responseBody,
                    e
            );

        } catch (IOException e) {

            throw new SellerKycDocumentUploadException(
                    "Failed to read KYC document",
                    e
            );

        } catch (SellerKycDocumentUploadException e) {

            throw e;

        } catch (Exception e) {

            throw new SellerKycDocumentUploadException(
                    "Failed to upload KYC document to Supabase: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private SellerKycResponse mapToResponse(
            SellerKyc kyc
    ) {

        return SellerKycResponse.builder()

                .id(
                        kyc.getId()
                )

                .sellerId(
                        kyc.getSeller()
                                .getId()
                )

                .businessType(
                        kyc.getBusinessType()
                )

                .gstNumber(
                        kyc.getGstNumber()
                )

                .gstDocumentUrl(
                        kyc.getGstDocumentUrl()
                )

                .registrationNumber(
                        kyc.getRegistrationNumber()
                )

                .registrationDocumentUrl(
                        kyc.getRegistrationDocumentUrl()
                )

                .ownerName(
                        kyc.getOwnerName()
                )

                .dateOfBirth(
                        kyc.getDateOfBirth()
                )

                .panNumber(
                        kyc.getPanNumber()
                )

                .panDocumentUrl(
                        kyc.getPanDocumentUrl()
                )

                .aadhaarNumber(
                        maskAadhaar(
                                kyc.getAadhaarNumber()
                        )
                )

                .aadhaarDocumentUrl(
                        kyc.getAadhaarDocumentUrl()
                )

                .businessAddress(
                        kyc.getBusinessAddress()
                )

                .city(
                        kyc.getCity()
                )

                .state(
                        kyc.getState()
                )

                .postalCode(
                        kyc.getPostalCode()
                )

                .country(
                        kyc.getCountry()
                )

                .addressDocumentUrl(
                        kyc.getAddressDocumentUrl()
                )

                .status(
                        kyc.getStatus()
                )

                .rejectionReason(
                        kyc.getRejectionReason()
                )

                .submittedAt(
                        kyc.getSubmittedAt()
                )

                .reviewedAt(
                        kyc.getReviewedAt()
                )

                .reviewedBy(
                        kyc.getReviewedBy()
                )

                .createdAt(
                        kyc.getCreatedAt()
                )

                .updatedAt(
                        kyc.getUpdatedAt()
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
                aadhaarNumber.length() != 12) {

            return null;
        }

        return "XXXX-XXXX-"
                + aadhaarNumber.substring(8);
    }

    // =========================================================
    // CHECK FILE
    // =========================================================

    private boolean hasFile(
            MultipartFile file
    ) {

        return file != null &&
                !file.isEmpty();
    }

    // =========================================================
    // NORMALIZE STRING
    // =========================================================

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String trimmed =
                value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }

    // =========================================================
    // NORMALIZE UPPERCASE
    // =========================================================

    private String normalizeUpper(
            String value
    ) {

        String normalized =
                normalize(value);

        return normalized == null
                ? null
                : normalized.toUpperCase(
                Locale.ROOT
        );
    }

    // =========================================================
    // DEFAULT COUNTRY
    // =========================================================

    private String getCountry(
            String country
    ) {

        String normalized =
                normalize(country);

        return normalized == null
                ? "India"
                : normalized;
    }
}