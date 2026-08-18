package com.nextcart.nextcart.subcategory_module.repository;

import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubCategoryRepository
        extends JpaRepository<SubCategory, Long> {

    boolean existsByCategoryIdAndNameIgnoreCase(
            Long categoryId,
            String name
    );

    List<SubCategory> findByCategoryId(Long categoryId);
}