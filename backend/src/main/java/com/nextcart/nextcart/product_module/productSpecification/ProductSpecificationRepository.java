package com.nextcart.nextcart.product_module.productSpecification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductSpecificationRepository
        extends JpaRepository<ProductSpecification, Long> {

    List<ProductSpecification>
    findByProductEntity_IdOrderBySpecificationNameAsc(
            Long productId
    );

    Optional<ProductSpecification>
    findByProductEntity_IdAndSpecificationNameIgnoreCase(
            Long productId,
            String specificationName
    );

    boolean existsByProductEntity_IdAndSpecificationNameIgnoreCase(
            Long productId,
            String specificationName
    );

    boolean existsByProductEntity_IdAndSpecificationNameIgnoreCaseAndIdNot(
            Long productId,
            String specificationName,
            Long id
    );

    void deleteByProductEntity_Id(Long productId);
}