package com.nextcart.nextcart.cart_module.entity;

import com.nextcart.nextcart.adcommon.entity.BaseEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;

import com.nextcart.nextcart.product_module.product_base.ProductEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table()
@Getter
@Setter
@NoArgsConstructor
public class CartItem extends BaseEntity {

    // Existing cart_id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn( nullable = false)
    private Cart cart;

    // Existing product_id - KEEP IT
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn( nullable = false)
    private ProductEntity productEntity;

    // New product_variant_id
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn( nullable = false)
    private ProductVariantEntity productVariant;

    // Existing quantity
    @Column(nullable = false)
    private Integer quantity;



    public CartItem(
            Cart cart,
            ProductEntity productEntity,
            ProductVariantEntity productVariant,
            Integer quantity) {

        this.cart = cart;
        this.productEntity = productEntity;
        this.productVariant = productVariant;
        this.quantity = quantity;
    }
}