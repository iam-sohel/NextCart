package com.nextcart.nextcart.product_module.productSpecification;

import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationCreateRequest;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationUpdateRequest;
import com.nextcart.nextcart.product_module.product_base.ProductEntity;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductSpecificationAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductSpecificationNotFoundException;
import com.nextcart.nextcart.product_module.product_base.ProductRepository;

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

    // =========================================================
    // CREATE SPECIFICATION
    // =========================================================

    @Override
    public ProductSpecificationResponse createSpecification(
            Long productId,
            ProductSpecificationCreateRequest request) {

        ProductEntity productEntity =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: "
                                                + productId
                                )
                        );

        String specificationName =
                request.getSpecificationName().trim();

        if (productSpecificationRepository
                .existsByProductEntity_IdAndSpecificationNameIgnoreCase(
                        productId,
                        specificationName)) {

            throw new ProductSpecificationAlreadyExistsException(
                    "Specification already exists for this product: "
                            + specificationName
            );
        }

        ProductSpecification specification =
                productSpecificationMapper.toEntity(request);

        specification.setProductEntity(productEntity);

        ProductSpecification savedSpecification =
                productSpecificationRepository.save(specification);

        return productSpecificationMapper.toResponse(
                savedSpecification
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

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

    // =========================================================
    // GET BY PRODUCT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ProductSpecificationResponse>
    getSpecificationsByProductId(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException(
                    "Product not found with id: "
                            + productId
            );
        }

        return productSpecificationRepository
                .findByProductEntity_IdOrderBySpecificationNameAsc(
                        productId
                )
                .stream()
                .map(productSpecificationMapper::toResponse)
                .toList();
    }

    // =========================================================
    // UPDATE
    // =========================================================

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

        Long productId =
                specification.getProductEntity().getId();

        String specificationName =
                request.getSpecificationName().trim();

        if (productSpecificationRepository
                .existsByProductEntity_IdAndSpecificationNameIgnoreCaseAndIdNot(
                        productId,
                        specificationName,
                        id
                )) {

            throw new ProductSpecificationAlreadyExistsException(
                    "Specification already exists for this product: "
                            + specificationName
            );
        }

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

    // =========================================================
    // DELETE
    // =========================================================

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

        productSpecificationRepository.delete(specification);
    }
}