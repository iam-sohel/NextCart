package com.gesmio.havlook.product_module.productInformation.repository;

import com.gesmio.havlook.product_module.productInformation.entity.ProductInformationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductInformationRepository
        extends JpaRepository<ProductInformationEntity, Long> {

    Optional<ProductInformationEntity> findByProductEntity_Id(Long productId);

    boolean existsByProductEntity_Id(Long productId);
}