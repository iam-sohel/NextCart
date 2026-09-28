package com.nextcart.nextcart.seller_module.product.service;

import com.nextcart.nextcart.seller_module.product.dto.SellerProductCreateRequest;
import com.nextcart.nextcart.seller_module.product.dto.SellerProductResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SellerProductService {

    SellerProductResponse createProduct(
            Long userId,
            SellerProductCreateRequest request,
            MultipartFile[] images
    );
}