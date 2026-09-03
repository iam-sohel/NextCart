package com.nextcart.nextcart.seller_module.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "seller_kyc",
        indexes = {
                @Index(
                        name = "idx_seller_kyc_seller_id",
                        columnList = "seller_id"
                ),
                @Index(
                        name = "idx_seller_kyc_pan_number",
                        columnList = "pan_number"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerKyc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seller_id",
            nullable = false,
            unique = true
    )
    private Seller seller;

    @Column(name = "pan_number", length = 10)
    private String panNumber;

    @Column(name = "aadhaar_last_four", length = 4)
    private String aadhaarLastFour;

    @Column(name = "gst_number", length = 30)
    private String gstNumber;

    /*
     * Protected storage references for uploaded PDF documents.
     */
    @Column(name = "pan_document_path", length = 500)
    private String panDocumentPath;

    @Column(name = "aadhaar_document_path", length = 500)
    private String aadhaarDocumentPath;

    @Column(name = "gst_document_path", length = 500)
    private String gstDocumentPath;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private KycStatus status = KycStatus.PENDING;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}