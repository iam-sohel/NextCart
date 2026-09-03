package com.nextcart.nextcart.seller_module.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "seller_bank_accounts",
        indexes = {
                @Index(
                        name = "idx_seller_bank_accounts_seller_id",
                        columnList = "seller_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerBankAccount {

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

    @Column(
            name = "account_holder_name",
            nullable = false,
            length = 150
    )
    private String accountHolderName;

    @Column(
            name = "account_number",
            nullable = false,
            length = 30
    )
    private String accountNumber;

    @Column(
            name = "ifsc_code",
            nullable = false,
            length = 11
    )
    private String ifscCode;

    @Column(
            name = "bank_name",
            nullable = false,
            length = 150
    )
    private String bankName;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "verification_status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private BankVerificationStatus verificationStatus =
            BankVerificationStatus.PENDING;

    @Builder.Default
    @Column(
            name = "active",
            nullable = false
    )
    private boolean active = true;

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