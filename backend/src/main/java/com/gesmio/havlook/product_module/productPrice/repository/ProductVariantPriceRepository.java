package com.gesmio.havlook.product_module.productPrice.repository;

import com.gesmio.havlook.product_module.productPrice.entity.ProductVariantPriceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductVariantPriceRepository
        extends JpaRepository<ProductVariantPriceEntity, Long> {

    Optional<ProductVariantPriceEntity> findByProductVariantId(
            Long productVariantId
    );

    /*
     * Query optimization:
     * Fetch prices for all variants in a single DB query.
     */
    List<ProductVariantPriceEntity> findByProductVariantIdIn(
            Collection<Long> variantIds
    );

    boolean existsByProductVariantId(
            Long productVariantId
    );
}