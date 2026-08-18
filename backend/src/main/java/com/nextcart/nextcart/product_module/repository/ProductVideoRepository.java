package com.nextcart.nextcart.product_module.repository;

import com.nextcart.nextcart.product_module.entity.ProductVideo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductVideoRepository
        extends JpaRepository<ProductVideo, Long> {

    List<ProductVideo> findByProductId(Long productId);
}