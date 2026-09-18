package com.nextcart.nextcart.seller_module.sellerKyc.service;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycRequest;
import com.nextcart.nextcart.seller_module.sellerKyc.dto.SellerKycResponse;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.KycStatus;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.SellerKyc;
import com.nextcart.nextcart.seller_module.sellerKyc.repository.SellerKycRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Value("${supabase.service-role-key}")
    private String supabaseServiceRoleKey;

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

        Seller seller = getSellerByUserId(userId);

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(seller.getId())
                .orElse(null);


        // -----------------------------------------------------
        // VERIFIED KYC CANNOT BE MODIFIED
        // -----------------------------------------------------

        if (kyc != null &&
                kyc.getStatus() == KycStatus.VERIFIED) {

            throw new IllegalStateException(
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
                                new IllegalArgumentException(
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

        Seller seller =
                getSellerByUserId(userId);

        SellerKyc kyc =
                sellerKycRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "KYC details not found"
                                )
                        );


        // -----------------------------------------------------
        // VERIFIED KYC CANNOT BE MODIFIED
        // -----------------------------------------------------

        if (kyc.getStatus() == KycStatus.VERIFIED) {

            throw new IllegalStateException(
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
                                new IllegalArgumentException(
                                        "Submit KYC details before uploading documents"
                                )
                        );


        // -----------------------------------------------------
        // VERIFIED KYC CANNOT BE MODIFIED
        // -----------------------------------------------------

        if (kyc.getStatus() == KycStatus.VERIFIED) {

            throw new IllegalStateException(
                    "Verified KYC documents cannot be modified"
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

        if (userId == null) {

            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

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

    private void validatePdf(
            MultipartFile file
    ) {

        if (file == null ||
                file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Document cannot be empty"
            );
        }


        // -----------------------------------------------------
        // SIZE
        // -----------------------------------------------------

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
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

            throw new IllegalArgumentException(
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

            throw new IllegalArgumentException(
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


            /*
             * Example:
             *
             * 10/pan/550e8400-e29b-41d4-a716-446655440000.pdf
             */


            // -------------------------------------------------
            // SUPABASE STORAGE API
            // -------------------------------------------------

            String uploadUrl =
                    supabaseUrl
                            + "/storage/v1/object/"
                            + kycBucket
                            + "/"
                            + objectPath;


            // -------------------------------------------------
            // HEADERS
            // -------------------------------------------------

            HttpHeaders headers =
                    new HttpHeaders();

            headers.set(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + supabaseServiceRoleKey
            );

            headers.set(
                    "apikey",
                    supabaseServiceRoleKey
            );

            headers.setContentType(
                    MediaType.APPLICATION_PDF
            );


            // -------------------------------------------------
            // REQUEST
            // -------------------------------------------------

            HttpEntity<byte[]> request =
                    new HttpEntity<>(
                            file.getBytes(),
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

                throw new IllegalStateException(
                        "Failed to upload KYC document to Supabase"
                );
            }


            // -------------------------------------------------
            // RETURN OBJECT URL
            // -------------------------------------------------

            return supabaseUrl
                    + "/storage/v1/object/"
                    + kycBucket
                    + "/"
                    + objectPath;

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Failed to read KYC document",
                    e
            );

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to upload KYC document to Supabase",
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