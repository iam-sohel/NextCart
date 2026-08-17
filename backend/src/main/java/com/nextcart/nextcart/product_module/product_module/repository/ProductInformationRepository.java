package com.nextcart.nextcart.product_module.repository;

import com.nextcart.nextcart.product_module.entity.ProductInformation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductInformationRepository
        extends JpaRepository<ProductInformation, Long> {

    Optional<ProductInformation> findByProductId(Long productId);

    boolean existsByProductId(Long productId);
}