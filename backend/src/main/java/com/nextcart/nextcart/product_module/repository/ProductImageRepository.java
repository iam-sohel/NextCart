package com.nextcart.nextcart.product_module.repository;


import com.nextcart.nextcart.product_module.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository
        extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(
            Long productId
    );

    boolean existsByProductIdAndIsPrimaryTrue(
            Long productId
    );
}