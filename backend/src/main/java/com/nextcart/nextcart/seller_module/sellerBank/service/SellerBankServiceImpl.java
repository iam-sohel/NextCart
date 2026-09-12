package com.nextcart.nextcart.seller_module.sellerBank.service;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.sellerBank.dto.SellerBankRequest;
import com.nextcart.nextcart.seller_module.sellerBank.dto.SellerBankResponse;
import com.nextcart.nextcart.seller_module.sellerBank.entity.BankVerificationStatus;
import com.nextcart.nextcart.seller_module.sellerBank.entity.SellerBankAccount;
import com.nextcart.nextcart.seller_module.sellerBank.repository.SellerBankRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerBankServiceImpl implements SellerBankService {

    private final SellerRepository sellerRepository;
    private final SellerBankRepository sellerBankRepository;

    @Override
    public SellerBankResponse addBankAccount(
            Long userId,
            SellerBankRequest request
    ) {

        Seller seller = getSellerByUserId(userId);

        if (sellerBankRepository.existsBySellerId(seller.getId())) {
            throw new IllegalStateException(
                    "Bank account already exists"
            );
        }

        SellerBankAccount bankAccount =
                SellerBankAccount.builder()
                        .seller(seller)
                        .accountHolderName(
                                request.getAccountHolderName()
                        )
                        .accountNumber(
                                request.getAccountNumber()
                        )
                        .ifscCode(
                                request.getIfscCode().toUpperCase()
                        )
                        .bankName(
                                request.getBankName()
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

    @Override
    @Transactional(readOnly = true)
    public SellerBankResponse getMyBankAccount(
            Long userId
    ) {

        Seller seller = getSellerByUserId(userId);

        SellerBankAccount bankAccount =
                sellerBankRepository
                        .findBySellerId(seller.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Bank account not found"
                                )
                        );

        return mapToResponse(bankAccount);
    }

    @Override
    public SellerBankResponse updateBankAccount(
            Long userId,
            SellerBankRequest request
    ) {

        Seller seller = getSellerByUserId(userId);

        SellerBankAccount bankAccount =
                sellerBankRepository
                        .findBySellerId(seller.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Bank account not found"
                                )
                        );

        if (bankAccount.getVerificationStatus()
                == BankVerificationStatus.VERIFIED) {

            throw new IllegalStateException(
                    "Verified bank account cannot be modified"
            );
        }

        bankAccount.setAccountHolderName(
                request.getAccountHolderName()
        );

        bankAccount.setAccountNumber(
                request.getAccountNumber()
        );

        bankAccount.setIfscCode(
                request.getIfscCode().toUpperCase()
        );

        bankAccount.setBankName(
                request.getBankName()
        );

        bankAccount.setVerificationStatus(
                BankVerificationStatus.PENDING
        );

        bankAccount.setVerifiedAt(null);

        SellerBankAccount updated =
                sellerBankRepository.save(bankAccount);

        return mapToResponse(updated);
    }

    @Override
    public void deactivateBankAccount(
            Long userId
    ) {

        Seller seller = getSellerByUserId(userId);

        SellerBankAccount bankAccount =
                sellerBankRepository
                        .findBySellerId(seller.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Bank account not found"
                                )
                        );

        bankAccount.setActive(false);

        sellerBankRepository.save(bankAccount);
    }

    private Seller getSellerByUserId(Long userId) {

        return sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller profile not found"
                        )
                );
    }

    private SellerBankResponse mapToResponse(
            SellerBankAccount bankAccount
    ) {

        return SellerBankResponse.builder()
                .id(bankAccount.getId())
                .sellerId(
                        bankAccount.getSeller().getId()
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

    private String maskAccountNumber(
            String accountNumber
    ) {

        if (accountNumber == null
                || accountNumber.length() < 4) {

            return null;
        }

        return "XXXXXX"
                + accountNumber.substring(
                        accountNumber.length() - 4
                );
    }
}