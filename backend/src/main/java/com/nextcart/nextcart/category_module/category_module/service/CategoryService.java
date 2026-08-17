package com.nextcart.nextcart.category_module.service;

import com.nextcart.nextcart.category_module.dto.CategoryCreateRequest;
import com.nextcart.nextcart.category_module.dto.CategoryUpdateRequest;
import com.nextcart.nextcart.category_module.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryCreateRequest request);

    CategoryResponse getCategoryById(Long id);

    List<CategoryResponse> getAllCategories();

    CategoryResponse updateCategory(
            Long id,
            CategoryUpdateRequest request
    );

    void deleteCategory(Long id);
}