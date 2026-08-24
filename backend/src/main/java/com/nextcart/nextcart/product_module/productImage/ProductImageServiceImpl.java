package com.nextcart.nextcart.product_module.productImage;

import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageCreateRequest;
import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageResponse;
import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageUpdateRequest;
import com.nextcart.nextcart.product_module.exceptions.ProductImageNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.product_base.ProductRepository;

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

    // =========================================================
    // CREATE IMAGE
    // =========================================================

    @Override
    public ProductImageResponse createImage(
            ProductImageCreateRequest request) {

        ProductImageEntity productImageEntity = productRepository.findById(
                request.getProductId()
        ).orElseThrow(() ->
                new ProductNotFoundException(
                        "Product not found with id: "
                                + request.getProductId()
                )
        );

        ProductImageEntity image =
                productImageMapper.toEntity(request);

        image.setProduct(productE);

        /*
         * If this image is marked as primary,
         * remove primary status from existing images.
         */
        if (Boolean.TRUE.equals(image.getIsPrimary())) {

            List<ProductImage> existingImages =
                    productImageRepository
                            .findByProductIdOrderByDisplayOrderAsc(
                                    product.getId()
                            );

            existingImages.forEach(existing ->
                    existing.setIsPrimary(false)
            );
        }

        /*
         * If this is the first image, make it primary.
         */
        if (!productImageRepository
                .existsByProductIdAndIsPrimaryTrue(product.getId())) {

            image.setIsPrimary(true);
        }

        ProductImage savedImage =
                productImageRepository.save(image);

        return productImageMapper.toResponse(savedImage);
    }

    // =========================================================
    // GET IMAGE BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductImageResponse getImageById(Long id) {

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
                    "Product not found with id: " + productId
            );
        }

        return productImageRepository
                .findByProductIdOrderByDisplayOrderAsc(productId)
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
         * remove primary status from other images.
         */
        if (Boolean.TRUE.equals(image.getIsPrimary())) {

            List<ProductImage> existingImages =
                    productImageRepository
                            .findByProductIdOrderByDisplayOrderAsc(
                                    image.getProduct().getId()
                            );

            existingImages.stream()
                    .filter(existing ->
                            !existing.getId().equals(image.getId()))
                    .forEach(existing ->
                            existing.setIsPrimary(false)
                    );
        }

        ProductImage updatedImage =
                productImageRepository.save(image);

        return productImageMapper.toResponse(updatedImage);
    }

    // =========================================================
    // DELETE IMAGE
    // =========================================================

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

        Long productId =
                image.getProduct().getId();

        boolean wasPrimary =
                Boolean.TRUE.equals(image.getIsPrimary());

        productImageRepository.delete(image);

        /*
         * If primary image was deleted,
         * promote another image.
         */
        if (wasPrimary) {

            List<ProductImage> remainingImages =
                    productImageRepository
                            .findByProductIdOrderByDisplayOrderAsc(
                                    productId
                            );

            if (!remainingImages.isEmpty()) {

                ProductImage newPrimary =
                        remainingImages.get(0);

                newPrimary.setIsPrimary(true);

                productImageRepository.save(newPrimary);
            }
        }
    }
}