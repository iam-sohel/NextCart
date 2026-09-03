package com.nextcart.nextcart.seller_module.dto;

import com.nextcart.nextcart.seller_module.entity.KycStatus;
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

    private String aadhaarLastFour;

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