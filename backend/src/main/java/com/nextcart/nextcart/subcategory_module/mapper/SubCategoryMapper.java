package com.nextcart.nextcart.subcategory_module.mapper;

import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryCreateRequest;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryResponse;
import com.nextcart.nextcart.subcategory_module.dto.SubCategoryUpdateRequest;
import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.entity.SubCategoryStatus;
import org.springframework.stereotype.Component;

@Component
public class SubCategoryMapper {

    public SubCategory toEntity(
            SubCategoryCreateRequest request,
            Category category) {

        return SubCategory.builder()
                .category(category)
                .name(request.getName().trim())
                .status(SubCategoryStatus.ACTIVE)
                .build();
    }

    public SubCategoryResponse toResponse(
            SubCategory subCategory) {

        return SubCategoryResponse.builder()
                .id(subCategory.getId())
                .categoryId(subCategory.getCategory().getId())
                .categoryName(subCategory.getCategory().getName())
                .name(subCategory.getName())
                .status(subCategory.getStatus())
                .build();
    }

    public void updateEntity(
            SubCategoryUpdateRequest request,
            Category category,
            SubCategory subCategory) {

        subCategory.setCategory(category);
        subCategory.setName(request.getName().trim());
    }
}