package com.nextcart.nextcart.subcategory_module.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCategoryResponse {

    private Long id;

    private Long categoryId;

    private String categoryName;

    private String name;

}