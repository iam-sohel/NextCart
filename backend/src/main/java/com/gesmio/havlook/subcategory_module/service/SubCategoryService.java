package com.gesmio.havlook.subcategory_module.service;

import com.gesmio.havlook.subcategory_module.dto.SubCategoryCreateRequest;
import com.gesmio.havlook.subcategory_module.dto.SubCategoryResponse;
import com.gesmio.havlook.subcategory_module.dto.SubCategoryUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SubCategoryService {

    SubCategoryResponse createSubCategory(SubCategoryCreateRequest request);

    SubCategoryResponse getSubCategoryById(Long id);

    Page<SubCategoryResponse> getAllSubCategories(Pageable pageable);

    Page<SubCategoryResponse> getSubCategoriesByCategoryId(Long categoryId, Pageable pageable);

    SubCategoryResponse updateSubCategory(Long id, SubCategoryUpdateRequest request);

    void deactivateSubCategory(Long id);

    SubCategoryResponse restoreSubCategory(Long id);
}