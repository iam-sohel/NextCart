package com.gesmio.havlook.subcategory_module.dto;

import com.gesmio.havlook.subcategory_module.entity.SubCategoryStatus;
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

    private SubCategoryStatus status;
}