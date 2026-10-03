package com.gesmio.havlook.category_module.mapper;

import com.gesmio.havlook.category_module.dto.CategoryCreateRequest;
import com.gesmio.havlook.category_module.dto.CategoryResponse;
import com.gesmio.havlook.category_module.dto.CategoryUpdateRequest;
import com.gesmio.havlook.category_module.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryCreateRequest request) {

        Category category = new Category();

        category.setName(request.getName());

        return category;
    }

    public CategoryResponse toResponse(Category category) {

        CategoryResponse response = new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());
        response.setStatus(category.getStatus());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());

        return response;
    }

    public void updateEntity(
            CategoryUpdateRequest request,
            Category category) {

        category.setName(request.getName());
    }
}