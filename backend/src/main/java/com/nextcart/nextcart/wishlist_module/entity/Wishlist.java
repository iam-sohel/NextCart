package com.nextcart.nextcart.wishlist_module.entity;

import com.nextcart.nextcart.adcommon.entity.BaseEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.user_module.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "wishlists",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"user_id", "product_variant_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Wishlist extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariantEntity productVariant;

    public Wishlist(
            User user,
            ProductVariantEntity productVariant) {

        this.user = user;
        this.productVariant = productVariant;
    }
}