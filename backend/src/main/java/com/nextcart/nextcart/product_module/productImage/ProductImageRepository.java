package com.nextcart.nextcart.product_module.productImage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository
        extends JpaRepository<ProductImageEntity, Long> {

    List<ProductImageEntity> findByProductEntity_IdOrderByDisplayOrderAsc(
            Long productId
    );

    boolean existsByProductEntity_IdAndIsPrimaryTrue(
            Long productId
    );

    List<ProductImageEntity> findByProductEntity_IdAndIsPrimaryTrue(
            Long productId
    );

    void deleteByProductEntity_Id(Long productId);
}