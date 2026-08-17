package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.product_module.dto.productImage.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageResponse;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageUpdateRequest;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.ProductImage;
import com.nextcart.nextcart.product_module.exceptions.ProductImageNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.mapper.ProductImageMapper;
import com.nextcart.nextcart.product_module.repository.ProductImageRepository;
import com.nextcart.nextcart.product_module.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final ProductImageMapper productImageMapper;


    // =========================
    // CREATE IMAGE
    // =========================

    @Override
    public ProductImageResponse createImage(
            ProductImageCreateRequest request) {

        Product product = productRepository.findById(
                request.getProductId()
        ).orElseThrow(() ->
                new ProductNotFoundException(
                        "Product not found with id: "
                                + request.getProductId()
                )
        );

        /*
         * If this image is marked as primary,
         * remove primary status from existing images.
         */
        if (Boolean.TRUE.equals(request.getIsPrimary())) {

            makeExistingImagesNonPrimary(
                    request.getProductId()
            );
        }

        ProductImage image =
                productImageMapper.toEntity(
                        request,
                        product
                );

        ProductImage savedImage =
                productImageRepository.save(image);

        return productImageMapper.toResponse(
                savedImage
        );
    }


    // =========================
    // GET IMAGE BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public ProductImageResponse getImageById(
            Long id) {

        ProductImage image =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductImageNotFoundException(
                                        "Product image not found with id: "
                                                + id
                                )
                        );

        return productImageMapper.toResponse(image);
    }


    // =========================
    // GET ALL IMAGES
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getAllImages() {

        return productImageRepository.findAll()
                .stream()
                .map(productImageMapper::toResponse)
                .toList();
    }


    // =========================
    // GET IMAGES BY PRODUCT
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImagesByProductId(
            Long productId) {

        productRepository.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: "
                                        + productId
                        )
                );

        return productImageRepository
                .findByProductIdOrderByDisplayOrderAsc(
                        productId
                )
                .stream()
                .map(productImageMapper::toResponse)
                .toList();
    }


    // =========================
    // UPDATE IMAGE
    // =========================

    @Override
    public ProductImageResponse updateImage(
            Long id,
            ProductImageUpdateRequest request) {

        ProductImage image =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductImageNotFoundException(
                                        "Product image not found with id: "
                                                + id
                                )
                        );

        /*
         * If updated image becomes primary,
         * remove primary status from other images.
         */
        if (Boolean.TRUE.equals(request.getIsPrimary())) {

            makeExistingImagesNonPrimary(
                    image.getProduct().getId()
            );
        }

        productImageMapper.updateEntity(
                request,
                image
        );

        ProductImage updatedImage =
                productImageRepository.save(image);

        return productImageMapper.toResponse(
                updatedImage
        );
    }


    // =========================
    // DELETE IMAGE
    // =========================

    @Override
    public void deleteImage(Long id) {

        ProductImage image =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductImageNotFoundException(
                                        "Product image not found with id: "
                                                + id
                                )
                        );

        productImageRepository.delete(image);
    }


    // =========================
    // PRIMARY IMAGE HANDLING
    // =========================

    private void makeExistingImagesNonPrimary(
            Long productId) {

        List<ProductImage> images =
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(
                                productId
                        );

        images.forEach(image ->
                image.setIsPrimary(false)
        );

        productImageRepository.saveAll(images);
    }
}