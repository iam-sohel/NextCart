package com.gesmio.havlook.seller_module.product.service;

import com.gesmio.havlook.seller_module.product.dto.SellerProductCreateRequest;
import com.gesmio.havlook.seller_module.product.dto.SellerProductResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SellerProductService {

    SellerProductResponse createProduct(
            Long userId,
            SellerProductCreateRequest request,
            MultipartFile[] images
    );
}