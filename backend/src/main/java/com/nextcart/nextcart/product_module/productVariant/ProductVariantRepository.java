package com.nextcart.nextcart.product_module.productVariant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariantEntity, Long> {

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    Optional<ProductVariantEntity> findBySkuIgnoreCase(String sku);

    List<ProductVariantEntity> findByProductId(Long productId);

    Page<ProductVariantEntity> findByProductId(Long productId, Pageable pageable);

    Page<ProductVariantEntity> findByProductIdAndStatus(Long productId, ProductVariantStatus status, Pageable pageable);

    Optional<ProductVariantEntity> findByIdAndStatus(Long id, ProductVariantStatus status);
}