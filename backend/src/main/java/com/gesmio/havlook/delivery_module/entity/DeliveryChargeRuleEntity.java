package com.gesmio.havlook.delivery_module.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "delivery_charge_rules",
    indexes = {
        @Index(
            name = "idx_delivery_charge_active",
            columnList = "active"
        )
    }
)
@Getter
@Setter
public class DeliveryChargeRuleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String ruleCode;

    @Column(nullable = false, length = 100)
    private String ruleName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal minimumOrderAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal maximumOrderAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal deliveryFee;

    @Column(nullable = false, length = 3)
    private String currencyCode = "INR";


    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

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