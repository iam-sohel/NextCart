package com.nextcart.nextcart.cart_module.entity;

import com.nextcart.nextcart.adcommon.entity.BaseEntity;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductVariant;

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
    private Product product;

    // New product_variant_id
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn( nullable = false)
    private ProductVariant productVariant;

    // Existing quantity
    @Column(nullable = false)
    private Integer quantity;



    public CartItem(
            Cart cart,
            Product product,
            ProductVariant productVariant,
            Integer quantity) {

        this.cart = cart;
        this.product = product;
        this.productVariant = productVariant;
        this.quantity = quantity;
    }
}