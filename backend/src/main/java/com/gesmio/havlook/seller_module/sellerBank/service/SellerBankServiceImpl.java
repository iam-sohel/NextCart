package com.gesmio.havlook.seller_module.sellerBank.service;

import com.gesmio.havlook.seller_module.seller.entity.Seller;
import com.gesmio.havlook.seller_module.seller.repository.SellerRepository;
import com.gesmio.havlook.seller_module.sellerBank.dto.SellerBankRequest;
import com.gesmio.havlook.seller_module.sellerBank.dto.SellerBankResponse;
import com.gesmio.havlook.seller_module.sellerBank.entity.BankVerificationStatus;
import com.gesmio.havlook.seller_module.sellerBank.entity.SellerBankAccount;
import com.gesmio.havlook.seller_module.sellerBank.exception.SellerBankNotFoundException;
import com.gesmio.havlook.seller_module.sellerBank.exception.SellerBankStateException;
import com.gesmio.havlook.seller_module.sellerBank.exception.SellerBankValidationException;
import com.gesmio.havlook.seller_module.sellerBank.repository.SellerBankRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerBankServiceImpl implements SellerBankService {

    private final SellerRepository sellerRepository;

    private final SellerBankRepository sellerBankRepository;

    // =========================================================
    // ADD BANK ACCOUNT
    // =========================================================

    @Override
    public SellerBankResponse addBankAccount(
            Long userId,
            SellerBankRequest request
    ) {

        if (request == null) {
            throw new SellerBankValidationException(
                    "Bank account request is required"
            );
        }

        Seller seller =
                getSellerByUserId(userId);

        // -----------------------------------------------------
        // ONLY ONE BANK ACCOUNT ALLOWED
        // -----------------------------------------------------

        if (sellerBankRepository.existsBySellerId(
                seller.getId()
        )) {

            throw new SellerBankStateException(
                    "Bank account already exists"
            );
        }

        // -----------------------------------------------------
        // CREATE BANK ACCOUNT
        // -----------------------------------------------------

        SellerBankAccount bankAccount =
                SellerBankAccount.builder()
                        .seller(seller)
                        .accountHolderName(
                                normalize(
                                        request.getAccountHolderName()
                                )
                        )
                        .accountNumber(
                                normalize(
                                        request.getAccountNumber()
                                )
                        )
                        .ifscCode(
                                normalizeUpper(
                                        request.getIfscCode()
                                )
                        )
                        .bankName(
                                normalize(
                                        request.getBankName()
                                )
                        )
                        .verificationStatus(
                                BankVerificationStatus.PENDING
                        )
                        .active(true)
                        .build();

        SellerBankAccount saved =
                sellerBankRepository.save(bankAccount);

        return mapToResponse(saved);
    }

    // =========================================================
    // GET MY BANK ACCOUNT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerBankResponse getMyBankAccount(
            Long userId
    ) {

        Seller seller =
                getSellerByUserId(userId);

        SellerBankAccount bankAccount =
                sellerBankRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElseThrow(() ->
                                new SellerBankNotFoundException(
                                        "Bank account not found"
                                )
                        );

        return mapToResponse(bankAccount);
    }

    // =========================================================
    // UPDATE BANK ACCOUNT
    // =========================================================

    @Override
    public SellerBankResponse updateBankAccount(
            Long userId,
            SellerBankRequest request
    ) {

        if (request == null) {
            throw new SellerBankValidationException(
                    "Bank account update request is required"
            );
        }

        Seller seller =
                getSellerByUserId(userId);

        SellerBankAccount bankAccount =
                sellerBankRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElseThrow(() ->
                                new SellerBankNotFoundException(
                                        "Bank account not found"
                                )
                        );

        // -----------------------------------------------------
        // VERIFIED ACCOUNT CANNOT BE MODIFIED
        // -----------------------------------------------------

        if (bankAccount.getVerificationStatus()
                == BankVerificationStatus.VERIFIED) {

            throw new SellerBankStateException(
                    "Verified bank account cannot be modified"
            );
        }

        // -----------------------------------------------------
        // UPDATE BANK DETAILS
        // -----------------------------------------------------

        bankAccount.setAccountHolderName(
                normalize(
                        request.getAccountHolderName()
                )
        );

        bankAccount.setAccountNumber(
                normalize(
                        request.getAccountNumber()
                )
        );

        bankAccount.setIfscCode(
                normalizeUpper(
                        request.getIfscCode()
                )
        );

        bankAccount.setBankName(
                normalize(
                        request.getBankName()
                )
        );

        // -----------------------------------------------------
        // NEW VERIFICATION REQUIRED
        // -----------------------------------------------------

        bankAccount.setVerificationStatus(
                BankVerificationStatus.PENDING
        );

        bankAccount.setVerifiedAt(null);

        SellerBankAccount updated =
                sellerBankRepository.save(bankAccount);

        return mapToResponse(updated);
    }

    // =========================================================
    // DEACTIVATE BANK ACCOUNT
    // =========================================================

    @Override
    public void deactivateBankAccount(
            Long userId
    ) {

        Seller seller =
                getSellerByUserId(userId);

        SellerBankAccount bankAccount =
                sellerBankRepository
                        .findBySellerId(
                                seller.getId()
                        )
                        .orElseThrow(() ->
                                new SellerBankNotFoundException(
                                        "Bank account not found"
                                )
                        );

        // -----------------------------------------------------
        // ALREADY INACTIVE
        // -----------------------------------------------------

        if (!bankAccount.isActive()) {

            throw new SellerBankStateException(
                    "Bank account is already inactive"
            );
        }

        bankAccount.setActive(false);

        sellerBankRepository.save(bankAccount);
    }

    // =========================================================
    // FIND SELLER BY USER ID
    // =========================================================

    private Seller getSellerByUserId(
            Long userId
    ) {

        if (userId == null || userId <= 0) {

            throw new SellerBankValidationException(
                    "Valid user ID is required"
            );
        }

        return sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new SellerBankValidationException(
                                "Seller profile not found"
                        )
                );
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private SellerBankResponse mapToResponse(
            SellerBankAccount bankAccount
    ) {

        return SellerBankResponse.builder()

                .id(
                        bankAccount.getId()
                )

                .sellerId(
                        bankAccount.getSeller()
                                .getId()
                )

                .accountHolderName(
                        bankAccount.getAccountHolderName()
                )

                .maskedAccountNumber(
                        maskAccountNumber(
                                bankAccount.getAccountNumber()
                        )
                )

                .ifscCode(
                        bankAccount.getIfscCode()
                )

                .bankName(
                        bankAccount.getBankName()
                )

                .verificationStatus(
                        bankAccount.getVerificationStatus()
                )

                .active(
                        bankAccount.isActive()
                )

                .verifiedAt(
                        bankAccount.getVerifiedAt()
                )

                .createdAt(
                        bankAccount.getCreatedAt()
                )

                .updatedAt(
                        bankAccount.getUpdatedAt()
                )

                .build();
    }

    // =========================================================
    // MASK ACCOUNT NUMBER
    // =========================================================

    private String maskAccountNumber(
            String accountNumber
    ) {

        if (accountNumber == null ||
                accountNumber.length() < 4) {

            return null;
        }

        return "XXXXXX"
                + accountNumber.substring(
                        accountNumber.length() - 4
                );
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
                : normalized.toUpperCase();
    }
}