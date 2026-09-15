package com.nextcart.nextcart.seller_module.product;

import org.springframework.web.multipart.MultipartFile;

public interface SellerProductService {

    SellerProductResponse createProduct(
            Long userId,
            SellerProductCreateRequest request,
            MultipartFile[] images
    );
}