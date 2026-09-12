package com.nextcart.nextcart.seller_module.sellerKyc.entity;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
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
                ),
                @Index(
                        name = "idx_seller_kyc_gst_number",
                        columnList = "gst_number"
                ),
                @Index(
                        name = "idx_seller_kyc_status",
                        columnList = "status"
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

    /*
     * One Seller can have only one active KYC profile.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seller_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_seller_kyc_seller"
            )
    )
    private Seller seller;

    /*
     * PAN details
     */
    @Column(
            name = "pan_number",
            length = 10
    )
    private String panNumber;

    /*
     * Full Aadhaar number.
     *
     * IMPORTANT:
     * Encrypt this value before storing it in production.
     * Never expose it through response DTOs.
     */
    @Column(
            name = "aadhaar_number",
            length = 12
    )
    private String aadhaarNumber;

    /*
     * GST details
     */
    @Column(
            name = "gst_number",
            length = 30
    )
    private String gstNumber;

    /*
     * Secure storage references.
     *
     * These should contain an object-storage key/path,
     * NOT the actual PDF bytes.
     */
    @Column(
            name = "pan_document_path",
            length = 500
    )
    private String panDocumentPath;

    @Column(
            name = "aadhaar_document_path",
            length = 500
    )
    private String aadhaarDocumentPath;

    @Column(
            name = "gst_document_path",
            length = 500
    )
    private String gstDocumentPath;

    /*
     * KYC workflow status.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private KycStatus status = KycStatus.PENDING;

    /*
     * Admin rejection reason.
     */
    @Column(
            name = "rejection_reason",
            length = 500
    )
    private String rejectionReason;

    /*
     * Timestamp when Admin verified the KYC.
     */
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

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