package com.nextcart.nextcart.product_module.dto.product;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;

    private Long categoryId;
    private String categoryName;

    private Long subCategoryId;
    private String subCategoryName;

    private Long brandId;
    private String brandName;

    private String name;
    private String slug;
    private String description;
    private String status;
}