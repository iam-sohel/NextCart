package com.nextcart.nextcart.product_module.dto;

import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductResponse;
import com.nextcart.nextcart.product_module.dto.product_information.ProductInformationResponseDTO;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageResponse;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailsResponse {

    private ProductResponse product;

    private ProductInformationResponseDTO information;

    private List<ProductSpecificationResponse> specifications;

    private List<ProductVariantResponse> variants;

    private List<ProductImageResponse> images;


}