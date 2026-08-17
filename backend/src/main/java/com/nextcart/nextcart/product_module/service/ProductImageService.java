package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.productImage.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageResponse;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageUpdateRequest;

import java.util.List;

public interface ProductImageService {

    ProductImageResponse createImage(
            ProductImageCreateRequest request
    );

    ProductImageResponse getImageById(
            Long id
    );

    List<ProductImageResponse> getAllImages();

    List<ProductImageResponse> getImagesByProductId(
            Long productId
    );

    ProductImageResponse updateImage(
            Long id,
            ProductImageUpdateRequest request
    );

    void deleteImage(Long id);
}