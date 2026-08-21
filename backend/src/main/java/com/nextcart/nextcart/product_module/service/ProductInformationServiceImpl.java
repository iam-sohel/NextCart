package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.product_information.ProductInformationRequestDTO;
import com.nextcart.nextcart.product_module.dto.product_information.ProductInformationResponseDTO;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductInformation;
import com.nextcart.nextcart.product_module.repository.ProductInformationRepository;
import com.nextcart.nextcart.product_module.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductInformationServiceImpl
        implements ProductInformationService {

    private final ProductInformationRepository productInformationRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ProductInformationResponseDTO createProductInformation(
            ProductInformationRequestDTO requestDTO) {

        Product product = productRepository.findById(requestDTO.getProductId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: "
                                        + requestDTO.getProductId()));

        // Because ProductInformation has OneToOne relationship
        if (productInformationRepository
                .existsByProductId(requestDTO.getProductId())) {

            throw new RuntimeException(
                    "Product information already exists for product id: "
                            + requestDTO.getProductId());
        }

        ProductInformation information = ProductInformation.builder()
                .product(product)
                .shortDescription(requestDTO.getShortDescription())
                .longDescription(requestDTO.getLongDescription())
                .warranty(requestDTO.getWarranty())
                .manufacturer(requestDTO.getManufacturer())
                .build();

        ProductInformation saved =
                productInformationRepository.save(information);

        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductInformationResponseDTO getProductInformation(
            Long productId) {

        ProductInformation information =
                productInformationRepository.findByProductId(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product information not found for product id: "
                                                + productId));

        return mapToResponseDTO(information);
    }

    @Override
    @Transactional
    public ProductInformationResponseDTO updateProductInformation(
            Long productId,
            ProductInformationRequestDTO requestDTO) {

        ProductInformation information =
                productInformationRepository.findByProductId(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product information not found for product id: "
                                                + productId));

        information.setShortDescription(
                requestDTO.getShortDescription());

        information.setLongDescription(
                requestDTO.getLongDescription());

        information.setWarranty(
                requestDTO.getWarranty());

        information.setManufacturer(
                requestDTO.getManufacturer());

        ProductInformation updated =
                productInformationRepository.save(information);

        return mapToResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteProductInformation(Long productId) {

        ProductInformation information =
                productInformationRepository.findByProductId(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product information not found for product id: "
                                                + productId));

        productInformationRepository.delete(information);
    }

    private ProductInformationResponseDTO mapToResponseDTO(
            ProductInformation information) {

        return ProductInformationResponseDTO.builder()
                .id(information.getId())
                .productId(information.getProduct().getId())
                .shortDescription(information.getShortDescription())
                .longDescription(information.getLongDescription())
                .warranty(information.getWarranty())
                .manufacturer(information.getManufacturer())
                .build();
    }
}