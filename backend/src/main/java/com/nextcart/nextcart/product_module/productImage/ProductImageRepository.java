package com.nextcart.nextcart.product_module.productImage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImageEntity, Long> {

    List<ProductImageEntity> findByProductIdOrderByDisplayOrderAsc(Long productId);

    boolean existsByProductIdAndIsPrimaryTrue(Long productId);

    List<ProductImageEntity> findByProductIdAndIsPrimaryTrue(Long productId);

    void deleteByProductId(Long productId);
}