package com.nextcart.nextcart.seller_module.sellerBank.entity;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "seller_bank_accounts",
        indexes = {
                @Index(
                        name = "idx_seller_bank_seller_id",
                        columnList = "seller_id"
                ),
                @Index(
                        name = "idx_seller_bank_status",
                        columnList = "verification_status"
                ),
                @Index(
                        name = "idx_seller_bank_active",
                        columnList = "active"
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
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_seller_bank_seller"
            )
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