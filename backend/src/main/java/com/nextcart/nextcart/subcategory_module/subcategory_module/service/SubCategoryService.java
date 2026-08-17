package com.nextcart.nextcart.subcategory_module.service;

import com.nextcart.nextcart.subcategory_module.dto.*;

import java.util.List;

public interface SubCategoryService {

    SubCategoryResponse createSubCategory(
            SubCategoryCreateRequest request
    );

    SubCategoryResponse getSubCategoryById(Long id);

    List<SubCategoryResponse> getAllSubCategories();

    List<SubCategoryResponse> getSubCategoriesByCategoryId(
            Long categoryId
    );

    SubCategoryResponse updateSubCategory(
            Long id,
            SubCategoryUpdateRequest request
    );

    void deleteSubCategory(Long id);
}