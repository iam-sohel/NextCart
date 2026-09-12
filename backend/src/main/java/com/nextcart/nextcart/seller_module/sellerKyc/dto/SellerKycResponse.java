package com.nextcart.nextcart.seller_module.sellerKyc.dto;

import com.nextcart.nextcart.seller_module.sellerKyc.entity.KycStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerKycResponse {

    private Long id;

    private Long sellerId;

    private String panNumber;

    private String maskedAadhaarNumber;

    private String gstNumber;

    private boolean panDocumentUploaded;

    private boolean aadhaarDocumentUploaded;

    private boolean gstDocumentUploaded;

    private KycStatus status;

    private String rejectionReason;

    private LocalDateTime verifiedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}