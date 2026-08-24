package com.nextcart.nextcart.product_module.product_base.dto;

import com.nextcart.nextcart.product_module.product_base.ProductStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;

    private Long categoryId;

    private Long subCategoryId;

    private Long brandId;

    private String name;

    private String slug;

    private String description;

    private ProductStatus status;

    private Instant createdAt;

    private Instant updatedAt;
}