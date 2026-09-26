package com.nextcart.nextcart.product_module.productImage.service;

import com.nextcart.nextcart.product_module.productImage.exceptions.ProductImageNotFoundException;
import com.nextcart.nextcart.product_module.product_base.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.productImage.mapper.ProductImageMapper;
import com.nextcart.nextcart.product_module.productImage.repository.ProductImageRepository;
import com.nextcart.nextcart.product_module.productImage.dto.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.productImage.dto.ProductImageResponse;
import com.nextcart.nextcart.product_module.productImage.dto.ProductImageUpdateRequest;
import com.nextcart.nextcart.product_module.productImage.entity.ProductImageEntity;
import com.nextcart.nextcart.product_module.product_base.entity.ProductEntity;
import com.nextcart.nextcart.product_module.product_base.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductImageServiceImpl
        implements ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final ProductImageMapper productImageMapper;

    // =========================================================
    // CREATE IMAGE
    // =========================================================

    @Override
    public ProductImageResponse createImage(
            ProductImageCreateRequest request) {

        ProductEntity product =
                productRepository.findById(
                        request.getProductId()
                ).orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: "
                                        + request.getProductId()
                        )
                );

        ProductImageEntity image =
                productImageMapper.toEntity(request);

        image.setProductEntity(product);

        /*
         * If this image is marked as primary,
         * remove primary status from existing images.
         */
        if (Boolean.TRUE.equals(image.getIsPrimary())) {

            List<ProductImageEntity> existingImages =
                    productImageRepository
                            .findByProductEntity_IdOrderByDisplayOrderAsc(
                                    product.getId()
                            );

            existingImages.forEach(existing ->
                    existing.setIsPrimary(false)
            );
        }

        /*
         * If this is the first image,
         * automatically make it primary.
         */
        if (!productImageRepository
                .existsByProductEntity_IdAndIsPrimaryTrue(
                        product.getId()
                )) {

            image.setIsPrimary(true);
        }

        ProductImageEntity savedImage =
                productImageRepository.save(image);

        return productImageMapper.toResponse(
                savedImage
        );
    }

    // =========================================================
    // GET IMAGE BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductImageResponse getImageById(
            Long id) {

        ProductImageEntity image =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductImageNotFoundException(
                                        "Product image not found with id: "
                                                + id
                                )
                        );

        return productImageMapper.toResponse(
                image
        );
    }

    // =========================================================
    // GET ALL IMAGES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getAllImages() {

        return productImageRepository
                .findAll()
                .stream()
                .map(productImageMapper::toResponse)
                .toList();
    }

    // =========================================================
    // GET IMAGES BY PRODUCT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImagesByProductId(
            Long productId) {

        if (!productRepository.existsById(productId)) {

            throw new ProductNotFoundException(
                    "Product not found with id: "
                            + productId
            );
        }

        return productImageRepository
                .findByProductEntity_IdOrderByDisplayOrderAsc(
                        productId
                )
                .stream()
                .map(productImageMapper::toResponse)
                .toList();
    }

    // =========================================================
    // UPDATE IMAGE
    // =========================================================

    @Override
    public ProductImageResponse updateImage(
            Long id,
            ProductImageUpdateRequest request) {

        ProductImageEntity image =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductImageNotFoundException(
                                        "Product image not found with id: "
                                                + id
                                )
                        );

        /*
         * Update image fields.
         */
        productImageMapper.updateEntity(
                request,
                image
        );

        /*
         * If this image becomes primary,
         * remove primary status from all other
         * images belonging to the same product.
         */
        if (Boolean.TRUE.equals(
                image.getIsPrimary())) {

            List<ProductImageEntity> existingImages =
                    productImageRepository
                            .findByProductEntity_IdOrderByDisplayOrderAsc(
                                    image.getProductEntity().getId()
                            );

            existingImages.stream()
                    .filter(existing ->
                            !existing.getId()
                                    .equals(image.getId())
                    )
                    .forEach(existing ->
                            existing.setIsPrimary(false)
                    );
        }

        ProductImageEntity updatedImage =
                productImageRepository.save(image);

        return productImageMapper.toResponse(
                updatedImage
        );
    }

    // =========================================================
    // DELETE IMAGE
    // =========================================================

    @Override
    public void deleteImage(Long id) {

        ProductImageEntity image =
                productImageRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductImageNotFoundException(
                                        "Product image not found with id: "
                                                + id
                                )
                        );

        Long productId =
                image.getProductEntity().getId();

        boolean wasPrimary =
                Boolean.TRUE.equals(
                        image.getIsPrimary()
                );

        productImageRepository.delete(image);

        /*
         * If the primary image was deleted,
         * promote the first remaining image.
         */
        if (wasPrimary) {

            List<ProductImageEntity> remainingImages =
                    productImageRepository
                            .findByProductEntity_IdOrderByDisplayOrderAsc(
                                    productId
                            );

            if (!remainingImages.isEmpty()) {

                ProductImageEntity newPrimary =
                        remainingImages.get(0);

                newPrimary.setIsPrimary(true);

                productImageRepository.save(
                        newPrimary
                );
            }
        }
    }
}