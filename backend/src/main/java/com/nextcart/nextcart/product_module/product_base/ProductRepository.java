package com.nextcart.nextcart.product_module.product_base;



import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(
            String slug,
            Long id
    );

    Optional<ProductEntity> findByIdAndStatus(
            Long id,
            ProductStatus status
    );

    Optional<ProductEntity> findBySlugIgnoreCaseAndStatus(
            String slug,
            ProductStatus status
    );

    Page<ProductEntity> findAllByStatus(
            ProductStatus status,
            Pageable pageable
    );

    Page<ProductEntity> findAllByCategoryIdAndStatus(
            Long categoryId,
            ProductStatus status,
            Pageable pageable
    );

    Page<ProductEntity> findAllBySubCategoryIdAndStatus(
            Long subCategoryId,
            ProductStatus status,
            Pageable pageable
    );

    Page<ProductEntity> findAllByBrandIdAndStatus(
            Long brandId,
            ProductStatus status,
            Pageable pageable
    );
}