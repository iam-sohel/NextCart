package com.nextcart.nextcart.subcategory_module.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubCategoryUpdateRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "SubCategory name is required")
    @Size(max = 100, message = "SubCategory name must not exceed 100 characters")
    private String name;
}