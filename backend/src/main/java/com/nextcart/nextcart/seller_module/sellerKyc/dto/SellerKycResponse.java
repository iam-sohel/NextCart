package com.nextcart.nextcart.seller_module.sellerKyc.dto;

import com.nextcart.nextcart.seller_module.sellerKyc.entity.BusinessType;
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

    private BusinessType businessType;

    private String gstNumber;

    private String gstDocumentUrl;

    private String registrationNumber;

    private String registrationDocumentUrl;

    private String ownerName;

    private String panNumber;

    private String panDocumentUrl;

    /*
     * Aadhaar number is returned masked.
     * Example: XXXX-XXXX-1234
     */
    private String aadhaarNumber;

    private String aadhaarDocumentUrl;

    private String businessAddress;

    private String city;

    private String state;

    private String postalCode;

    private String country;

    private String addressDocumentUrl;

    private KycStatus status;

    private String rejectionReason;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    private Long reviewedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}