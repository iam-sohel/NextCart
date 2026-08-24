package com.nextcart.nextcart.product_module.productSpecification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductSpecificationRepository
        extends JpaRepository<ProductSpecification, Long> {

    List<ProductSpecification>
    findByProductIdOrderBySpecificationNameAsc(
            Long productId
    );

    Optional<ProductSpecification>
    findByProductIdAndSpecificationNameIgnoreCase(
            Long productId,
            String specificationName
    );

    boolean existsByProductIdAndSpecificationNameIgnoreCase(
            Long productId,
            String specificationName
    );

    boolean existsByProductIdAndSpecificationNameIgnoreCaseAndIdNot(
            Long productId,
            String specificationName,
            Long id
    );

    void deleteByProductId(Long productId);
}