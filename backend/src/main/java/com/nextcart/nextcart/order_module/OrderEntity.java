package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.user_module.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "orders",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_order_number",
                        columnNames = "order_number"
                )
        },
        indexes = {
                @Index(
                        name = "idx_orders_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_orders_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_orders_created_at",
                        columnList = "created_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "order_number",
            nullable = false,
            unique = true,
            length = 50
    )
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private OrderStatus status;

    // =========================================================
    // SHIPPING ADDRESS SNAPSHOT
    // =========================================================

    @Column(
            name = "shipping_full_name",
            nullable = false
    )
    private String shippingFullName;

    @Column(
            name = "shipping_phone_number",
            nullable = false
    )
    private String shippingPhoneNumber;

    @Column(
            name = "shipping_street_address",
            nullable = false
    )
    private String shippingStreetAddress;

    @Column(
            name = "shipping_landmark"
    )
    private String shippingLandmark;

    @Column(
            name = "shipping_city",
            nullable = false
    )
    private String shippingCity;

    @Column(
            name = "shipping_state",
            nullable = false
    )
    private String shippingState;

    @Column(
            name = "shipping_postal_code",
            nullable = false
    )
    private String shippingPostalCode;

    @Column(
            name = "shipping_country",
            nullable = false
    )
    private String shippingCountry;

    // =========================================================
    // PRICE SNAPSHOT
    // =========================================================

    @Column(
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(
            name = "discount_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(
            name = "shipping_charge",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal shippingCharge = BigDecimal.ZERO;

    @Column(
            name = "tax_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(
            nullable = false,
            length = 3
    )
    @Builder.Default
    private String currency = "INR";

    // =========================================================
    // ORDER ITEMS
    // =========================================================

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<OrderItemEntity> items = new ArrayList<>();

    // =========================================================
    // TIMESTAMPS
    // =========================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    // =========================================================
    // ENTITY LIFECYCLE
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

    // =========================================================
    // ORDER ITEM HELPERS
    // =========================================================

    public void addItem(OrderItemEntity item) {

        if (item == null) {
            throw new IllegalArgumentException(
                    "Order item cannot be null"
            );
        }

        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItemEntity item) {

        if (item == null) {
            return;
        }

        items.remove(item);
        item.setOrder(null);
    }

    public void clearItems() {

        for (OrderItemEntity item : items) {
            item.setOrder(null);
        }

        items.clear();
    }
}