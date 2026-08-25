package com.nextcart.nextcart.product_module.product_base.dto;

import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageResponse;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationResponse;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailsResponse {

    private Long id;

    private String name;

    private String slug;

    private String description;

    private Long categoryId;

    private Long subCategoryId;

    private Long brandId;

    private ProductInformationResponse information;

    private List<ProductSpecificationResponse> specifications;

    private List<ProductImageResponse> images;

    private List<ProductVariantResponse> variants;
}