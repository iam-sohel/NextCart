package com.nextcart.nextcart.product_module.repository;

import com.nextcart.nextcart.product_module.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    boolean existsBySkuIgnoreCase(String sku);

    List<ProductVariant> findByProductId(Long productId);
}