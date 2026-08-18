package com.nextcart.nextcart.product_module.mapper;

import com.nextcart.nextcart.product_module.dto.productImage.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageResponse;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageUpdateRequest;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductImage;
import org.springframework.stereotype.Component;

@Component
public class ProductImageMapper {

    public ProductImage toEntity(
            ProductImageCreateRequest request,
            Product product) {

        ProductImage image = new ProductImage();

        image.setProduct(product);
        image.setImageUrl(request.getImageUrl());
        image.setIsPrimary(request.getIsPrimary());
        image.setDisplayOrder(request.getDisplayOrder());

        return image;
    }

    public ProductImageResponse toResponse(
            ProductImage image) {

        ProductImageResponse response =
                new ProductImageResponse();

        response.setId(image.getId());

        response.setProductId(
                image.getProduct().getId()
        );

        response.setImageUrl(
                image.getImageUrl()
        );

        response.setIsPrimary(
                image.getIsPrimary()
        );

        response.setDisplayOrder(
                image.getDisplayOrder()
        );

        return response;
    }

    public void updateEntity(
            ProductImageUpdateRequest request,
            ProductImage image) {

        image.setImageUrl(
                request.getImageUrl()
        );

        image.setIsPrimary(
                request.getIsPrimary()
        );

        image.setDisplayOrder(
                request.getDisplayOrder()
        );
    }
}