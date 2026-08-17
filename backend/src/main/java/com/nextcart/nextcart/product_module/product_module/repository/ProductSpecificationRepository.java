package com.nextcart.nextcart.product_module.repository;

import com.nextcart.nextcart.product_module.entity.ProductSpecification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductSpecificationRepository
        extends JpaRepository<ProductSpecification, Long> {

    List<ProductSpecification> findByProductId(Long productId);
}

