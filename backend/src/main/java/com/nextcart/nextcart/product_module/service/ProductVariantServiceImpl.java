package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantCreateRequest;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantResponse;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantUpdateRequest;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductVariant;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantNotFoundException;
import com.nextcart.nextcart.product_module.mapper.ProductVariantMapper;
import com.nextcart.nextcart.product_module.repository.ProductRepository;
import com.nextcart.nextcart.product_module.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ProductVariantMapper productVariantMapper;

    // CREATE
    @Override
    public ProductVariantResponse createVariant(
            ProductVariantCreateRequest request) {

        Product product = productRepository.findById(
                request.getProductId()
        ).orElseThrow(() ->
                new ProductNotFoundException(
                        "Product not found with id: "
                                + request.getProductId()
                )
        );

        if (productVariantRepository.existsBySkuIgnoreCase(
                request.getSku())) {

            throw new ProductVariantAlreadyExistsException(
                    "Product variant already exists with SKU: "
                            + request.getSku()
            );
        }

        ProductVariant variant =
                productVariantMapper.toEntity(
                        request,
                        product
                );

        ProductVariant savedVariant =
                productVariantRepository.save(variant);

        return productVariantMapper.toResponse(
                savedVariant
        );
    }

    // GET BY ID
    @Override
    @Transactional(readOnly = true)
    public ProductVariantResponse getVariantById(Long id) {

        ProductVariant variant =
                productVariantRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + id
                                )
                        );

        return productVariantMapper.toResponse(variant);
    }

    // GET ALL
    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getAllVariants() {

        return productVariantRepository.findAll()
                .stream()
                .map(productVariantMapper::toResponse)
                .toList();
    }

    // GET BY PRODUCT ID
    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getVariantsByProductId(
            Long productId) {

        productRepository.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: "
                                        + productId
                        )
                );

        return productVariantRepository
                .findByProductId(productId)
                .stream()
                .map(productVariantMapper::toResponse)
                .toList();
    }

    // UPDATE
    @Override
    public ProductVariantResponse updateVariant(
            Long id,
            ProductVariantUpdateRequest request) {

        ProductVariant variant =
                productVariantRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + id
                                )
                        );

        Product product = productRepository.findById(
                request.getProductId()
        ).orElseThrow(() ->
                new ProductNotFoundException(
                        "Product not found with id: "
                                + request.getProductId()
                )
        );

        if (!variant.getSku().equalsIgnoreCase(
                request.getSku())
                && productVariantRepository
                .existsBySkuIgnoreCase(request.getSku())) {

            throw new ProductVariantAlreadyExistsException(
                    "Product variant already exists with SKU: "
                            + request.getSku()
            );
        }

        productVariantMapper.updateEntity(
                request,
                product,
                variant
        );

        ProductVariant updatedVariant =
                productVariantRepository.save(variant);

        return productVariantMapper.toResponse(
                updatedVariant
        );
    }

    // DELETE
    @Override
    public void deleteVariant(Long id) {

        ProductVariant variant =
                productVariantRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + id
                                )
                        );

        productVariantRepository.delete(variant);
    }
}