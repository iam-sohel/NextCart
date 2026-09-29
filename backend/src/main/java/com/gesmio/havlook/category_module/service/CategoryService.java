package com.gesmio.havlook.category_module.service;

import com.gesmio.havlook.category_module.dto.CategoryCreateRequest;
import com.gesmio.havlook.category_module.dto.CategoryResponse;
import com.gesmio.havlook.category_module.dto.CategoryUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {

    CategoryResponse createCategory(CategoryCreateRequest request);

    CategoryResponse getCategoryById(Long id);

    Page<CategoryResponse> getAllCategories(Pageable pageable);

    CategoryResponse updateCategory(Long id, CategoryUpdateRequest request);

    void deactivateCategory(Long id);

    CategoryResponse restoreCategory(Long id);
}