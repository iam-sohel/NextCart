package com.nextcart.nextcart.product_module.product_base;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

    // ============================
    // Seller Product Queries
    // ============================

    Optional<ProductEntity> findByIdAndSellerId(
            Long id,
            Long sellerId
    );

    Page<ProductEntity> findAllBySellerId(
            Long sellerId,
            Pageable pageable
    );

    Page<ProductEntity> findAllBySellerIdAndStatus(
            Long sellerId,
            ProductStatus status,
            Pageable pageable
    );

    boolean existsByIdAndSellerId(
            Long id,
            Long sellerId
    );
    /*
     * Keyword search across product name, description and the
     * related brand / category / subcategory names.
     *
     * Case-insensitive containment match; only ACTIVE products.
     */
    @Query("""
            SELECT p FROM ProductEntity p
            WHERE p.status = :status
              AND (
                    LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(p.subCategory.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY p.name ASC
            """)
    List<ProductEntity> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("status") ProductStatus status
    );
}