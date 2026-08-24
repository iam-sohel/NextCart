package com.nextcart.nextcart.product_module.productInformation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductInformationRepository
        extends JpaRepository<ProductInformationEntity, Long> {

    Optional<ProductInformationEntity> findByProductId(Long productId);

    boolean existsByProductId(Long productId);
}