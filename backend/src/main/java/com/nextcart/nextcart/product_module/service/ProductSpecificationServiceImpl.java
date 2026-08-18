package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationUpdateRequest;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductSpecification;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductSpecificationNotFoundException;
import com.nextcart.nextcart.product_module.mapper.ProductSpecificationMapper;
import com.nextcart.nextcart.product_module.repository.ProductRepository;
import com.nextcart.nextcart.product_module.repository.ProductSpecificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductSpecificationServiceImpl
        implements ProductSpecificationService {

    private final ProductSpecificationRepository
            productSpecificationRepository;

    private final ProductRepository productRepository;

    private final ProductSpecificationMapper
            productSpecificationMapper;


    // =========================
    // CREATE
    // =========================

    @Override
    public ProductSpecificationResponse createSpecification(
            ProductSpecificationCreateRequest request) {

        Product product = productRepository.findById(
                request.getProductId()
        ).orElseThrow(() ->
                new ProductNotFoundException(
                        "Product not found with id: "
                                + request.getProductId()
                )
        );

        ProductSpecification specification =
                productSpecificationMapper.toEntity(
                        request,
                        product
                );

        ProductSpecification savedSpecification =
                productSpecificationRepository.save(
                        specification
                );

        return productSpecificationMapper.toResponse(
                savedSpecification
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public ProductSpecificationResponse getSpecificationById(
            Long id) {

        ProductSpecification specification =
                productSpecificationRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductSpecificationNotFoundException(
                                        "Product specification not found with id: "
                                                + id
                                )
                        );

        return productSpecificationMapper.toResponse(
                specification
        );
    }


    // =========================
    // GET ALL
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductSpecificationResponse>
    getAllSpecifications() {

        return productSpecificationRepository.findAll()
                .stream()
                .map(productSpecificationMapper::toResponse)
                .toList();
    }


    // =========================
    // GET BY PRODUCT
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductSpecificationResponse>
    getSpecificationsByProductId(Long productId) {

        productRepository.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: "
                                        + productId
                        )
                );

        return productSpecificationRepository
                .findByProductId(productId)
                .stream()
                .map(productSpecificationMapper::toResponse)
                .toList();
    }


    // =========================
    // UPDATE
    // =========================

    @Override
    public ProductSpecificationResponse updateSpecification(
            Long id,
            ProductSpecificationUpdateRequest request) {

        ProductSpecification specification =
                productSpecificationRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductSpecificationNotFoundException(
                                        "Product specification not found with id: "
                                                + id
                                )
                        );

        productSpecificationMapper.updateEntity(
                request,
                specification
        );

        ProductSpecification updatedSpecification =
                productSpecificationRepository.save(
                        specification
                );

        return productSpecificationMapper.toResponse(
                updatedSpecification
        );
    }


    // =========================
    // DELETE
    // =========================

    @Override
    public void deleteSpecification(Long id) {

        ProductSpecification specification =
                productSpecificationRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductSpecificationNotFoundException(
                                        "Product specification not found with id: "
                                                + id
                                )
                        );

        productSpecificationRepository.delete(
                specification
        );
    }
}