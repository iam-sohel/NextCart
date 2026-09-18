package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.sellerVerification.SellerVerification;
import com.nextcart.nextcart.seller_module.sellerVerification.SellerVerificationRepository;
import com.nextcart.nextcart.seller_module.sellerVerification.SellerVerificationService;
import com.nextcart.nextcart.seller_module.sellerVerification.SellerVerificationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSellerVerificationServiceImpl
        implements AdminSellerVerificationService {

    private final SellerVerificationRepository sellerVerificationRepository;
    private final SellerRepository sellerRepository;
    private final SellerVerificationService sellerVerificationService;


    // =========================================================
    // GET ALL VERIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<SellerVerification> getAllVerifications(
            Pageable pageable
    ) {

        return sellerVerificationRepository.findAll(pageable);
    }


    // =========================================================
    // GET PENDING VERIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<SellerVerification> getPendingVerifications(
            Pageable pageable
    ) {

        /*
         * Admin should review only automated verification
         * records that successfully completed the checks.
         *
         * PASSED means:
         * Email  -> PASSED
         * Mobile -> PASSED
         * PAN    -> PASSED
         * GST    -> PASSED
         *
         * Final seller approval is still done manually by admin.
         */

        return sellerVerificationRepository
                .findAllByOverallStatus(
                        SellerVerificationStatus.PASSED,
                        pageable
                );
    }


    // =========================================================
    // GET SELLER VERIFICATION
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerVerification getVerificationBySellerId(
            Long sellerId
    ) {

        validateSellerExists(sellerId);

        return sellerVerificationRepository
                .findBySellerId(sellerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller verification record not found"
                        )
                );
    }


    // =========================================================
    // APPROVE SELLER
    // =========================================================

    @Override
    public SellerVerification approveVerification(
            Long sellerId,
            Long adminUserId
    ) {

        validateSellerExists(sellerId);

        if (adminUserId == null) {
            throw new IllegalArgumentException(
                    "Admin user ID is required"
            );
        }

        SellerVerification verification =
                sellerVerificationRepository
                        .findBySellerId(sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Seller verification record not found"
                                )
                        );

        /*
         * Do not allow admin approval unless all automated
         * verification checks have passed.
         */
        if (verification.getOverallStatus()
                != SellerVerificationStatus.PASSED) {

            throw new IllegalStateException(
                    "Seller cannot be approved because verification status is "
                            + verification.getOverallStatus()
                            + ". All verification checks must pass first."
            );
        }

        /*
         * Delegate the actual approval operation to the existing
         * SellerVerificationService.
         *
         * This keeps:
         *
         * seller.verified = true
         * KYC = VERIFIED
         * verification = APPROVED
         * reviewedAt
         * reviewedBy
         *
         * in one place.
         */
        SellerVerification approvedVerification =
                sellerVerificationService.approveSeller(
                        sellerId,
                        adminUserId
                );

        return approvedVerification;
    }


    // =========================================================
    // REJECT SELLER
    // =========================================================

    @Override
    public SellerVerification rejectVerification(
            Long sellerId,
            Long adminUserId,
            String reason
    ) {

        validateSellerExists(sellerId);

        if (adminUserId == null) {
            throw new IllegalArgumentException(
                    "Admin user ID is required"
            );
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException(
                    "Rejection reason is required"
            );
        }

        String normalizedReason = reason.trim();

        if (normalizedReason.length() > 1000) {
            throw new IllegalArgumentException(
                    "Rejection reason must not exceed 1000 characters"
            );
        }

        SellerVerification verification =
                sellerVerificationRepository
                        .findBySellerId(sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Seller verification record not found"
                                )
                        );

        /*
         * Do not allow rejection of an already approved seller
         * through this verification workflow without explicitly
         * introducing a separate re-verification/revocation flow.
         */
        if (verification.getOverallStatus()
                == SellerVerificationStatus.APPROVED) {

            throw new IllegalStateException(
                    "Approved seller cannot be rejected through this workflow"
            );
        }

        SellerVerification rejectedVerification =
                sellerVerificationService.rejectSeller(
                        sellerId,
                        adminUserId,
                        normalizedReason
                );

        return rejectedVerification;
    }


    // =========================================================
    // VALIDATE SELLER
    // =========================================================

    private void validateSellerExists(Long sellerId) {

        if (sellerId == null) {
            throw new IllegalArgumentException(
                    "Seller ID is required"
            );
        }

        sellerRepository.findById(sellerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller not found"
                        )
                );
    }
}