package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.product_information.ProductInformationRequestDTO;
import com.nextcart.nextcart.product_module.dto.product_information.ProductInformationResponseDTO;

public interface ProductInformationService {

    ProductInformationResponseDTO createProductInformation(
            ProductInformationRequestDTO requestDTO);

    ProductInformationResponseDTO getProductInformation(
            Long productId);

    ProductInformationResponseDTO updateProductInformation(
            Long productId,
            ProductInformationRequestDTO requestDTO);

    void deleteProductInformation(Long productId);
}