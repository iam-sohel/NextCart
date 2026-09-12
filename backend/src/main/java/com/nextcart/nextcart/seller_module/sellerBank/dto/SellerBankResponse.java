package com.nextcart.nextcart.seller_module.sellerBank.dto;

import com.nextcart.nextcart.seller_module.sellerBank.entity.BankVerificationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerBankResponse {

    private Long id;

    private Long sellerId;

    private String accountHolderName;

    private String maskedAccountNumber;

    private String ifscCode;

    private String bankName;

    private BankVerificationStatus verificationStatus;

    private boolean active;

    private LocalDateTime verifiedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}