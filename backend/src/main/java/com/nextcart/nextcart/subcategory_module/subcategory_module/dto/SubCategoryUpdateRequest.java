package com.nextcart.nextcart.subcategory_module.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubCategoryUpdateRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "SubCategory name is required")
    private String name;

    @NotBlank(message = "Status is required")
    private String status;
}