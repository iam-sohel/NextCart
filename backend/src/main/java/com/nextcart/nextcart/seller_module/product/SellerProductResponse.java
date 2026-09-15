package com.nextcart.nextcart.seller_module.product;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProductResponse {

    private Long id;

    private Long categoryId;

    private Long subCategoryId;

    private Long brandId;

    private String name;

    private String slug;

    private String description;

    private String status;

    private SellerProductInformationResponse information;

    private List<SellerProductSpecificationResponse> specifications;

    private List<SellerProductVariantResponse> variants;

    private List<SellerProductImageResponse> images;
}