package com.gesmio.havlook.product_module.productImage.service;

import com.gesmio.havlook.product_module.productImage.dto.ProductImageCreateRequest;
import com.gesmio.havlook.product_module.productImage.dto.ProductImageResponse;
import com.gesmio.havlook.product_module.productImage.dto.ProductImageUpdateRequest;

import java.util.List;

public interface ProductImageService {

    ProductImageResponse createImage(ProductImageCreateRequest request);

    ProductImageResponse getImageById(Long id);

    List<ProductImageResponse> getAllImages();

    List<ProductImageResponse> getImagesByProductId(Long productId);

    ProductImageResponse updateImage(Long id, ProductImageUpdateRequest request);

    void deleteImage(Long id);
}