package com.nextcart.nextcart.address_module.entity;

import com.nextcart.nextcart.customer_module.entity.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "addresses",
        indexes = {
                @Index(name = "idx_addresses_customer_id", columnList = "customer_id"),
                @Index(name = "idx_addresses_default", columnList = "is_default")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // CUSTOMER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_addresses_customer")
    )
    private Customer customer;

    // =========================================================
    // ADDRESS DETAILS
    // =========================================================

    @Column(
            nullable = false,
            length = 150
    )
    private String fullName;

    @Column(
            nullable = false,
            length = 20
    )
    private String phoneNumber;

    @Column(
            nullable = false,
            length = 255
    )
    private String streetAddress;

    @Column(length = 255)
    private String landmark;

    @Column(
            nullable = false,
            length = 100
    )
    private String city;

    @Column(
            nullable = false,
            length = 100
    )
    private String state;

    @Column(
            nullable = false,
            length = 20
    )
    private String postalCode;

    @Column(
            nullable = false,
            length = 100
    )
    private String country;

    @Column(
            name = "is_default",
            nullable = false
    )
    @Builder.Default
    private Boolean isDefault = false;

    // =========================================================
    // TIMESTAMPS
    // =========================================================

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            nullable = false
    )
    private LocalDateTime updatedAt;

    // =========================================================
    // JPA CALLBACKS
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }
}