package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.brand_module.entity.Brand;
import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "products",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_products_slug",
                        columnNames = "slug"
                )
        },
        indexes = {
                @Index(
                        name = "idx_products_seller_id",
                        columnList = "seller_id"
                ),
                @Index(
                        name = "idx_products_category_id",
                        columnList = "category_id"
                ),
                @Index(
                        name = "idx_products_subcategory_id",
                        columnList = "subcategory_id"
                ),
                @Index(
                        name = "idx_products_brand_id",
                        columnList = "brand_id"
                ),
                @Index(
                        name = "idx_products_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Seller who owns/created this product.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seller_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_products_seller"
            )
    )
    private Seller seller;

    /*
     * Existing Category.
     * Seller selects it; Seller does not create it.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "category_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_products_category"
            )
    )
    private Category category;

    /*
     * Existing SubCategory.
     * Must belong to the selected Category.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "subcategory_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_products_subcategory"
            )
    )
    private SubCategory subCategory;

    /*
     * Existing Brand.
     * Seller selects it; Seller does not create it.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "brand_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_products_brand"
            )
    )
    private Brand brand;

    @Column(
            name = "name",
            nullable = false,
            length = 200
    )
    private String name;

    @Column(
            name = "slug",
            nullable = false,
            length = 250
    )
    private String slug;

    @Column(
            name = "description",
            columnDefinition = "TEXT"
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {

        Instant now = Instant.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = Instant.now();
    }
}