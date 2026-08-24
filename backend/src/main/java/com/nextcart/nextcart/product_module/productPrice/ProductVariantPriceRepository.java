package com.nextcart.nextcart.product_module.productPrice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductVariantPriceRepository
        extends JpaRepository<ProductVariantPriceEntity, Long> {

    Optional<ProductVariantPriceEntity> findByProductVariantId(
            Long productVariantId
    );

    boolean existsByProductVariantId(
            Long productVariantId
    );
}