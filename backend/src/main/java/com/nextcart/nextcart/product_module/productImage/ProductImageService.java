package com.nextcart.nextcart.product_module.productImage;

import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageResponse;
import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageUpdateRequest;

import java.util.List;

public interface ProductImageService {

    ProductImageResponse createImage(ProductImageCreateRequest request);

    ProductImageResponse getImageById(Long id);

    List<ProductImageResponse> getAllImages();

    List<ProductImageResponse> getImagesByProductId(Long productId);

    ProductImageResponse updateImage(Long id, ProductImageUpdateRequest request);

    void deleteImage(Long id);
}