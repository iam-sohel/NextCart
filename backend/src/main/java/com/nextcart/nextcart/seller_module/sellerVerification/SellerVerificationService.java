package com.nextcart.nextcart.seller_module.sellerVerification;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.KycStatus;
import com.nextcart.nextcart.seller_module.sellerKyc.entity.SellerKyc;
import com.nextcart.nextcart.seller_module.sellerKyc.repository.SellerKycRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerVerificationService {

    private final SellerRepository sellerRepository;
    private final SellerKycRepository sellerKycRepository;
    private final SellerVerificationRepository sellerVerificationRepository;

    private final EmailValidationService emailValidationService;
    private final PhoneVerificationService phoneVerificationService;
    private final PanKycService panKycService;
    private final GstService gstService;


    // =========================================================
    // AUTOMATED SELLER VERIFICATION
    // =========================================================

    public SellerVerification verifySeller(Long sellerId) {

        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller not found"
                        )
                );

        if (!seller.isActive()) {
            throw new IllegalStateException(
                    "Seller account is inactive"
            );
        }

        SellerKyc kyc = sellerKycRepository
                .findBySellerId(sellerId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Seller KYC details not found"
                        )
                );

        SellerVerification verification =
                sellerVerificationRepository
                        .findBySellerId(sellerId)
                        .orElseGet(() ->
                                SellerVerification.builder()
                                        .seller(seller)
                                        .build()
                        );

        verification.setOverallStatus(
                SellerVerificationStatus.IN_PROGRESS
        );

        verification.setStartedAt(
                LocalDateTime.now()
        );

        verification.setCompletedAt(null);
        verification.setReviewedAt(null);
        verification.setReviewedBy(null);
        verification.setRejectionReason(null);

        sellerVerificationRepository.save(verification);


        // =====================================================
        // 1. EMAIL VERIFICATION
        // =====================================================

        String email = seller.getUser() != null
                ? seller.getUser().getEmail()
                : null;

        if (email == null || email.isBlank()) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.FAILED,
                    VerificationCheckStatus.FAILED,
                    "Email is not available for seller"
            );
        }

        verification.setEmailStatus(
                VerificationCheckStatus.IN_PROGRESS
        );

        sellerVerificationRepository.save(verification);

        EmailValidationService.EmailVerificationResult
                emailResult;

        try {

            emailResult =
                    emailValidationService.verify(email);

        } catch (Exception ex) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.REVIEW,
                    VerificationCheckStatus.REVIEW,
                    "Email verification service failed: "
                            + safeMessage(ex)
            );
        }

        verification.setEmailStatus(
                toCheckStatus(
                        emailResult.status(),
                        emailResult.passed()
                )
        );

        verification.setEmailResult(
                buildEmailResult(emailResult)
        );

        sellerVerificationRepository.save(verification);

        if (!emailResult.passed()) {

            SellerVerificationStatus overallStatus =
                    verification.getEmailStatus()
                            == VerificationCheckStatus.REVIEW
                            ? SellerVerificationStatus.REVIEW
                            : SellerVerificationStatus.FAILED;

            return completeVerification(
                    verification,
                    overallStatus
            );
        }


        // =====================================================
        // 2. MOBILE VERIFICATION
        // =====================================================

        String phone = seller.getUser() != null
                ? seller.getUser().getPhone()
                : null;

        if (phone == null || phone.isBlank()) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.FAILED,
                    VerificationCheckStatus.FAILED,
                    "Mobile number is not available for seller"
            );
        }

        verification.setMobileStatus(
                VerificationCheckStatus.IN_PROGRESS
        );

        sellerVerificationRepository.save(verification);

        PhoneVerificationService.PhoneVerificationResult
                mobileResult;

        try {

            mobileResult =
                    phoneVerificationService.verify(
                            phone,
                            "IN"
                    );

        } catch (Exception ex) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.REVIEW,
                    VerificationCheckStatus.REVIEW,
                    "Mobile verification service failed: "
                            + safeMessage(ex)
            );
        }

        verification.setMobileStatus(
                toCheckStatus(
                        mobileResult.status(),
                        mobileResult.passed()
                )
        );

        verification.setMobileResult(
                buildMobileResult(mobileResult)
        );

        sellerVerificationRepository.save(verification);

        if (!mobileResult.passed()) {

            SellerVerificationStatus overallStatus =
                    verification.getMobileStatus()
                            == VerificationCheckStatus.REVIEW
                            ? SellerVerificationStatus.REVIEW
                            : SellerVerificationStatus.FAILED;

            return completeVerification(
                    verification,
                    overallStatus
            );
        }


        // =====================================================
        // 3. PAN VERIFICATION
        // =====================================================

        if (kyc.getPanNumber() == null
                || kyc.getPanNumber().isBlank()) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.FAILED,
                    VerificationCheckStatus.FAILED,
                    "PAN number is not available in KYC"
            );
        }

        if (kyc.getDateOfBirth() == null) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.FAILED,
                    VerificationCheckStatus.FAILED,
                    "Date of birth is not available in KYC"
            );
        }

        verification.setPanStatus(
                VerificationCheckStatus.IN_PROGRESS
        );

        sellerVerificationRepository.save(verification);

        PanKycService.PanVerificationResult
                panResult;

        try {

            panResult =
                    panKycService.verify(
                            kyc.getPanNumber(),
                            kyc.getOwnerName(),
                            kyc.getDateOfBirth()
                    );

        } catch (Exception ex) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.REVIEW,
                    VerificationCheckStatus.REVIEW,
                    "PAN verification service failed: "
                            + safeMessage(ex)
            );
        }

        verification.setPanStatus(
                toCheckStatus(
                        panResult.status(),
                        panResult.passed()
                )
        );

        verification.setPanResult(
                buildPanResult(panResult)
        );

        sellerVerificationRepository.save(verification);

        if (!panResult.passed()) {

            SellerVerificationStatus overallStatus =
                    verification.getPanStatus()
                            == VerificationCheckStatus.REVIEW
                            ? SellerVerificationStatus.REVIEW
                            : SellerVerificationStatus.FAILED;

            return completeVerification(
                    verification,
                    overallStatus
            );
        }


        // =====================================================
        // 4. GST VERIFICATION
        // =====================================================

        if (kyc.getGstNumber() == null
                || kyc.getGstNumber().isBlank()) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.FAILED,
                    VerificationCheckStatus.FAILED,
                    "GSTIN is required for automated seller verification"
            );
        }

        verification.setGstinStatus(
                VerificationCheckStatus.IN_PROGRESS
        );

        sellerVerificationRepository.save(verification);

        GstService.GstVerificationResult
                gstResult;

        try {

            gstResult =
                    gstService.verify(
                            kyc.getGstNumber()
                    );

        } catch (Exception ex) {

            return failVerification(
                    verification,
                    SellerVerificationStatus.REVIEW,
                    VerificationCheckStatus.REVIEW,
                    "GST verification service failed: "
                            + safeMessage(ex)
            );
        }

        verification.setGstinStatus(
                toCheckStatus(
                        gstResult.status(),
                        gstResult.passed()
                )
        );

        verification.setGstinResult(
                buildGstResult(gstResult)
        );

        sellerVerificationRepository.save(verification);

        if (!gstResult.passed()) {

            SellerVerificationStatus overallStatus =
                    verification.getGstinStatus()
                            == VerificationCheckStatus.REVIEW
                            ? SellerVerificationStatus.REVIEW
                            : SellerVerificationStatus.FAILED;

            return completeVerification(
                    verification,
                    overallStatus
            );
        }


        // =====================================================
        // ALL FOUR AUTOMATED CHECKS PASSED
        // =====================================================

        verification.setEmailStatus(
                VerificationCheckStatus.PASSED
        );

        verification.setMobileStatus(
                VerificationCheckStatus.PASSED
        );

        verification.setPanStatus(
                VerificationCheckStatus.PASSED
        );

        verification.setGstinStatus(
                VerificationCheckStatus.PASSED
        );

        verification.setOverallStatus(
                SellerVerificationStatus.PASSED
        );

        verification.setCompletedAt(
                LocalDateTime.now()
        );

        /*
         * IMPORTANT:
         *
         * Do NOT set seller.verified = true here.
         *
         * Automated verification only establishes that
         * the configured checks passed.
         *
         * Admin must give the final approval.
         */

        return sellerVerificationRepository.save(
                verification
        );
    }


    // =========================================================
    // GET VERIFICATION
    // =========================================================

    @Transactional(readOnly = true)
    public SellerVerification getVerification(Long sellerId) {

        return sellerVerificationRepository
                .findBySellerId(sellerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller verification not found"
                        )
                );
    }


    // =========================================================
    // ADMIN APPROVE SELLER
    // =========================================================

    public SellerVerification approveSeller(
            Long sellerId,
            Long adminUserId
    ) {

        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller not found"
                        )
                );

        SellerVerification verification =
                sellerVerificationRepository
                        .findBySellerId(sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Seller verification not found"
                                )
                        );

        /*
         * Admin can approve only after all automated
         * verification checks have passed.
         */
        if (verification.getOverallStatus()
                != SellerVerificationStatus.PASSED) {

            throw new IllegalStateException(
                    "Seller verification must be PASSED before approval"
            );
        }

        SellerKyc kyc =
                sellerKycRepository
                        .findBySellerId(sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Seller KYC not found"
                                )
                        );


        // -----------------------------------------------------
        // FINAL SELLER APPROVAL
        // -----------------------------------------------------

        seller.setVerified(true);

        /*
         * KYC becomes VERIFIED only after Admin approval.
         */
        kyc.setStatus(
                KycStatus.VERIFIED
        );

        /*
         * Verification record becomes APPROVED.
         */
        verification.setOverallStatus(
                SellerVerificationStatus.APPROVED
        );

        verification.setReviewedAt(
                LocalDateTime.now()
        );

        verification.setReviewedBy(
                adminUserId
        );

        verification.setRejectionReason(
                null
        );


        sellerRepository.save(seller);

        sellerKycRepository.save(kyc);

        return sellerVerificationRepository.save(
                verification
        );
    }


    // =========================================================
    // ADMIN REJECT SELLER
    // =========================================================

    public SellerVerification rejectSeller(
            Long sellerId,
            Long adminUserId,
            String reason
    ) {

        if (reason == null || reason.isBlank()) {

            throw new IllegalArgumentException(
                    "Rejection reason is required"
            );
        }

        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller not found"
                        )
                );

        SellerVerification verification =
                sellerVerificationRepository
                        .findBySellerId(sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Seller verification not found"
                                )
                        );

        SellerKyc kyc =
                sellerKycRepository
                        .findBySellerId(sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Seller KYC not found"
                                )
                        );


        // -----------------------------------------------------
        // FINAL SELLER REJECTION
        // -----------------------------------------------------

        seller.setVerified(false);

        /*
         * KYC becomes REJECTED after Admin rejection.
         */
        kyc.setStatus(
                KycStatus.REJECTED
        );

        verification.setOverallStatus(
                SellerVerificationStatus.REJECTED
        );

        verification.setReviewedAt(
                LocalDateTime.now()
        );

        verification.setReviewedBy(
                adminUserId
        );

        verification.setRejectionReason(
                reason.trim()
        );


        sellerRepository.save(seller);

        sellerKycRepository.save(kyc);

        return sellerVerificationRepository.save(
                verification
        );
    }


    // =========================================================
    // COMPLETE VERIFICATION
    // =========================================================

    private SellerVerification completeVerification(
            SellerVerification verification,
            SellerVerificationStatus status
    ) {

        verification.setOverallStatus(status);

        verification.setCompletedAt(
                LocalDateTime.now()
        );

        return sellerVerificationRepository.save(
                verification
        );
    }


    // =========================================================
    // FAIL / REVIEW VERIFICATION
    // =========================================================

    private SellerVerification failVerification(
            SellerVerification verification,
            SellerVerificationStatus overallStatus,
            VerificationCheckStatus checkStatus,
            String message
    ) {

        verification.setOverallStatus(
                overallStatus
        );

        verification.setCompletedAt(
                LocalDateTime.now()
        );

        /*
         * Set the first available non-started check to the
         * supplied status only when applicable.
         */
        if (verification.getEmailStatus()
                == VerificationCheckStatus.IN_PROGRESS) {

            verification.setEmailStatus(checkStatus);
            verification.setEmailResult(message);

        } else if (verification.getMobileStatus()
                == VerificationCheckStatus.IN_PROGRESS) {

            verification.setMobileStatus(checkStatus);
            verification.setMobileResult(message);

        } else if (verification.getPanStatus()
                == VerificationCheckStatus.IN_PROGRESS) {

            verification.setPanStatus(checkStatus);
            verification.setPanResult(message);

        } else if (verification.getGstinStatus()
                == VerificationCheckStatus.IN_PROGRESS) {

            verification.setGstinStatus(checkStatus);
            verification.setGstinResult(message);
        }

        return sellerVerificationRepository.save(
                verification
        );
    }


    // =========================================================
    // CHECK STATUS MAPPER
    // =========================================================

    private VerificationCheckStatus toCheckStatus(
            String status,
            boolean passed
    ) {

        if (passed) {
            return VerificationCheckStatus.PASSED;
        }

        if (status == null) {
            return VerificationCheckStatus.FAILED;
        }

        String normalized =
                status.trim().toUpperCase();

        if (normalized.contains("REVIEW")
                || normalized.contains("CHALLENGE")
                || normalized.contains("PENDING")) {

            return VerificationCheckStatus.REVIEW;
        }

        return VerificationCheckStatus.FAILED;
    }


    // =========================================================
    // EMAIL RESULT
    // =========================================================

    private String buildEmailResult(
            EmailValidationService.EmailVerificationResult result
    ) {

        return String.format(
                "status=%s, score=%s, disposable=%s, valid=%s, result=%s, message=%s",
                result.status(),
                result.score(),
                result.disposable(),
                result.valid(),
                result.result(),
                result.message()
        );
    }


    // =========================================================
    // MOBILE RESULT
    // =========================================================

    private String buildMobileResult(
            PhoneVerificationService.PhoneVerificationResult result
    ) {

        return String.format(
                "status=%s, valid=%s, internationalFormat=%s, countryCode=%s, countryName=%s, location=%s, carrier=%s, lineType=%s, message=%s",
                result.status(),
                result.valid(),
                result.internationalFormat(),
                result.countryCode(),
                result.countryName(),
                result.location(),
                result.carrier(),
                result.lineType(),
                result.message()
        );
    }


    // =========================================================
    // PAN RESULT
    // =========================================================

    private String buildPanResult(
            PanKycService.PanVerificationResult result
    ) {

        return String.format(
                "status=%s, nameMatch=%s, dateOfBirthMatch=%s, transactionId=%s, message=%s",
                result.status(),
                result.nameMatch(),
                result.dateOfBirthMatch(),
                result.transactionId(),
                result.message()
        );
    }


    // =========================================================
    // GST RESULT
    // =========================================================

    private String buildGstResult(
            GstService.GstVerificationResult result
    ) {

        return String.format(
                "status=%s, gstin=%s, legalName=%s, tradeName=%s, constitution=%s, taxPayerType=%s, registrationDate=%s, primaryAddress=%s, message=%s",
                result.status(),
                result.gstin(),
                result.legalName(),
                result.tradeName(),
                result.constitution(),
                result.taxPayerType(),
                result.registrationDate(),
                result.primaryAddress(),
                result.message()
        );
    }


    // =========================================================
    // SAFE EXCEPTION MESSAGE
    // =========================================================

    private String safeMessage(Exception ex) {

        if (ex.getMessage() == null
                || ex.getMessage().isBlank()) {

            return "Unknown verification service error";
        }

        return ex.getMessage();
    }
}