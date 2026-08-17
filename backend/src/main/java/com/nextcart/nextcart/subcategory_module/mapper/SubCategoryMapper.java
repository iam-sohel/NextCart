package com.nextcart.nextcart.subcategory_module.mapper;

import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.subcategory_module.dto.*;
import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import org.springframework.stereotype.Component;

@Component
public class SubCategoryMapper {

    public SubCategory toEntity(
            SubCategoryCreateRequest request,
            Category category) {

        SubCategory subCategory = new SubCategory();

        subCategory.setCategory(category);
        subCategory.setName(request.getName());
        subCategory.setStatus("ACTIVE");

        return subCategory;
    }

    public SubCategoryResponse toResponse(SubCategory subCategory) {

        SubCategoryResponse response = new SubCategoryResponse();

        response.setId(subCategory.getId());

        response.setCategoryId(
                subCategory.getCategory().getId()
        );

        response.setCategoryName(
                subCategory.getCategory().getName()
        );

        response.setName(subCategory.getName());


        return response;
    }

    public void updateEntity(
            SubCategoryUpdateRequest request,
            Category category,
            SubCategory subCategory) {

        subCategory.setCategory(category);
        subCategory.setName(request.getName());
        subCategory.setStatus(request.getStatus());
    }
}