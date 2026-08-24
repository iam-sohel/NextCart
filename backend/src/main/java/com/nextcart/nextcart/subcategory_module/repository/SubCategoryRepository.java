package com.nextcart.nextcart.subcategory_module.repository;

import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.entity.SubCategoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {

    boolean existsByCategoryIdAndNameIgnoreCase(Long categoryId, String name);

    boolean existsByCategoryIdAndNameIgnoreCaseAndIdNot(Long categoryId, String name, Long id);

    Optional<SubCategory> findByIdAndStatus(Long id, SubCategoryStatus status);

    Page<SubCategory> findAllByStatus(SubCategoryStatus status, Pageable pageable);

    Page<SubCategory> findAllByCategoryIdAndStatus(Long categoryId, SubCategoryStatus status, Pageable pageable);
}