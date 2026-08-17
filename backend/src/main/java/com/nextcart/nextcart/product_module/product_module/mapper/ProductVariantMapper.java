package com.nextcart.nextcart.product_module.mapper;

import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantCreateRequest;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantResponse;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantUpdateRequest;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductVariant;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantMapper {

    public ProductVariant toEntity(
            ProductVariantCreateRequest request,
            Product product) {

        ProductVariant variant = new ProductVariant();

        variant.setProduct(product);
        variant.setSku(request.getSku());
        variant.setPrice(request.getPrice());


        return variant;
    }

    public ProductVariantResponse toResponse(
            ProductVariant variant) {

        ProductVariantResponse response =
                new ProductVariantResponse();

        response.setId(variant.getId());

        response.setProductId(
                variant.getProduct().getId()
        );

        response.setSku(variant.getSku());
        response.setPrice(variant.getPrice());


        return response;
    }

    public void updateEntity(
            ProductVariantUpdateRequest request,
            Product product,
            ProductVariant variant) {

        variant.setProduct(product);
        variant.setSku(request.getSku());
        variant.setPrice(request.getPrice());

    }
}