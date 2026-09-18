package com.nextcart.nextcart.seller_module.sellerKyc.entity;

import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_kyc", indexes = {@Index(name = "idx_seller_kyc_seller_id", columnList = "seller_id"), @Index(name = "idx_seller_kyc_status", columnList = "status"), @Index(name = "idx_seller_kyc_gst_number", columnList = "gst_number"), @Index(name = "idx_seller_kyc_pan_number", columnList = "pan_number")})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerKyc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // SELLER
    // =========================================================

    /**
     * Seller associated with this KYC.
     * <p>
     * One seller can have one current KYC record.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_seller_kyc_seller"))
    private Seller seller;


    // =========================================================
    // BUSINESS DETAILS
    // =========================================================

    /**
     * Business type.
     * <p>
     * Examples:
     * PROPRIETORSHIP
     * PARTNERSHIP
     * LLP
     * PRIVATE_LIMITED
     * PUBLIC_LIMITED
     * OTHER
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false, length = 30)
    private BusinessType businessType;

    /**
     * GST Identification Number.
     */
    @Column(name = "gst_number", length = 15)
    private String gstNumber;

    /**
     * GST Certificate PDF storage reference.
     */
    @Column(name = "gst_document_url", length = 500)
    private String gstDocumentUrl;

    /**
     * Business registration number.
     */
    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    /**
     * Business registration certificate PDF
     * storage reference.
     */
    @Column(name = "registration_document_url", length = 500)
    private String registrationDocumentUrl;


    // =========================================================
// OWNER / AUTHORIZED PERSON DETAILS
// =========================================================

    /**
     * Owner or authorized person's full name.
     */
    @Column(name = "owner_name", nullable = false, length = 150)
    private String ownerName;

    /**
     * Date of birth of owner / authorized person.
     * Required for PAN KYC verification.
     */
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    /**
     * PAN number of owner / authorized person.
     */
    @Column(name = "pan_number", nullable = false, length = 10)
    private String panNumber;

    /**
     * PAN Card PDF storage reference.
     */
    @Column(name = "pan_document_url", nullable = false, length = 500)
    private String panDocumentUrl;

    /**
     * Aadhaar number of owner / authorized person.
     */
    @Column(name = "aadhaar_number", length = 12)
    private String aadhaarNumber;

    /**
     * Aadhaar Card PDF storage reference.
     */
    @Column(name = "aadhaar_document_url", length = 500)
    private String aadhaarDocumentUrl;


    // =========================================================
    // BUSINESS ADDRESS
    // =========================================================

    /**
     * Complete registered business address.
     */
    @Column(name = "business_address", nullable = false, length = 500)
    private String businessAddress;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "postal_code", nullable = false, length = 10)
    private String postalCode;

    @Column(name = "country", nullable = false, length = 100)
    @Builder.Default
    private String country = "India";

    /**
     * Business address proof PDF storage reference.
     */
    @Column(name = "address_document_url", nullable = false, length = 500)
    private String addressDocumentUrl;


    // =========================================================
    // KYC STATUS
    // =========================================================

    /**
     * Current KYC verification status.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private KycStatus status = KycStatus.PENDING;

    /**
     * Reason provided by Admin when KYC is rejected.
     */
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    /**
     * Date/time when seller submitted KYC.
     */
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    /**
     * Date/time when Admin reviewed KYC.
     */
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /**
     * Admin User ID who reviewed the KYC.
     */
    @Column(name = "reviewed_by")
    private Long reviewedBy;


    // =========================================================
    // AUDIT FIELDS
    // =========================================================

    @Column(name = "created_at", nullable = false, updatable = false)
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