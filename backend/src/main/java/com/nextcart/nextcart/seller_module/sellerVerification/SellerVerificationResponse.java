package com.nextcart.nextcart.seller_module.sellerVerification;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerVerificationResponse {

    private Long id;

    private Long sellerId;

    private String businessName;

    private String email;

    private String phone;

    private boolean sellerVerified;

    private boolean sellerActive;

    private SellerVerificationStatus overallStatus;

    private VerificationCheckStatus emailStatus;
    private String emailResult;

    private VerificationCheckStatus mobileStatus;
    private String mobileResult;

    private VerificationCheckStatus panStatus;
    private String panResult;

    private VerificationCheckStatus gstinStatus;
    private String gstinResult;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    private LocalDateTime reviewedAt;
    private Long reviewedBy;

    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}