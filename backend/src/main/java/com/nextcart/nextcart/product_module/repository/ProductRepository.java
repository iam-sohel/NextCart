package com.nextcart.nextcart.product_module.repository;

import com.nextcart.nextcart.product_module.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlugIgnoreCase(String slug);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findBySubCategoryId(Long subCategoryId);

    List<Product> findByCategoryIdAndSubCategoryId(
            Long categoryId,
            Long subCategoryId
    );

    List<Product> findByNameContainingIgnoreCase(
            String keyword
    );

    List<Product> findByCategoryIdAndNameContainingIgnoreCase(
            Long categoryId,
            String keyword
    );

    List<Product> findBySubCategoryIdAndNameContainingIgnoreCase(
            Long subCategoryId,
            String keyword
    );

    List<Product> findByCategoryIdAndSubCategoryIdAndNameContainingIgnoreCase(
            Long categoryId,
            Long subCategoryId,
            String keyword
    );

}