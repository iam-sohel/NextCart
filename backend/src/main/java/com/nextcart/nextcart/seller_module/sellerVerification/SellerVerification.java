package com.nextcart.nextcart.seller_module.sellerVerification;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@Entity
@Table(name = "seller_verification")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // SELLER
    // =========================================================

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seller_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_seller_verification_seller"
            )
    )
    private Seller seller;


    // =========================================================
    // OVERALL VERIFICATION STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "overall_status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private SellerVerificationStatus overallStatus =
            SellerVerificationStatus.NOT_STARTED;


    // =========================================================
    // EMAIL VERIFICATION
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "email_status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private VerificationCheckStatus emailStatus =
            VerificationCheckStatus.NOT_STARTED;

    @Column(name = "email_result", length = 1000)
    private String emailResult;


    // =========================================================
    // MOBILE VERIFICATION
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "mobile_status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private VerificationCheckStatus mobileStatus =
            VerificationCheckStatus.NOT_STARTED;

    @Column(name = "mobile_result", length = 1000)
    private String mobileResult;


    // =========================================================
    // PAN VERIFICATION
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "pan_status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private VerificationCheckStatus panStatus =
            VerificationCheckStatus.NOT_STARTED;

    @Column(name = "pan_result", length = 1000)
    private String panResult;


    // =========================================================
    // GSTIN VERIFICATION
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "gstin_status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private VerificationCheckStatus gstinStatus =
            VerificationCheckStatus.NOT_STARTED;

    @Column(name = "gstin_result", length = 1000)
    private String gstinResult;


    // =========================================================
    // VERIFICATION TIMESTAMPS
    // =========================================================

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;


    // =========================================================
    // ADMIN REVIEW
    // =========================================================

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;


    // =========================================================
    // AUDIT
    // =========================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // =========================================================
    // JPA CALLBACKS
    // =========================================================

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