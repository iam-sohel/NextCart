package com.nextcart.nextcart.product_module.productInformation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductInformationRepository
        extends JpaRepository<ProductInformationEntity, Long> {

    Optional<ProductInformationEntity> findByProductEntity_Id(Long productId);

    boolean existsByProductEntity_Id(Long productId);
}