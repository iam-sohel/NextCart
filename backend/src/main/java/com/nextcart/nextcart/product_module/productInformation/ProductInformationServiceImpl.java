package com.nextcart.nextcart.product_module.productInformation;

import com.nextcart.nextcart.product_module.exceptions.ProductInformationAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductInformationNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationCreateRequest;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationResponse;
import com.nextcart.nextcart.product_module.productInformation.productInformation.ProductInformationUpdateRequest;
import com.nextcart.nextcart.product_module.product_base.ProductEntity;
import com.nextcart.nextcart.product_module.product_base.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductInformationServiceImpl
        implements ProductInformationService {

    private final ProductInformationRepository productInformationRepository;
    private final ProductRepository productRepository;
    private final ProductInformationMapper productInformationMapper;

    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public ProductInformationResponse createInformation(
            Long productId,
            ProductInformationCreateRequest request) {

        ProductEntity productEntity = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        if (productInformationRepository.existsByProductEntity_Id(productId)) {
            throw new ProductInformationAlreadyExistsException(
                    "Product information already exists for product id: "
                            + productId
            );
        }

        ProductInformationEntity information =
                productInformationMapper.toEntity(request);

        information.setProductEntity(productEntity);

        ProductInformationEntity savedInformation =
                productInformationRepository.save(information);

        return productInformationMapper.toResponse(
                savedInformation
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductInformationResponse getInformationById(
            Long id) {

        ProductInformationEntity information =
                productInformationRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductInformationNotFoundException(
                                        "Product information not found with id: "
                                                + id
                                )
                        );

        return productInformationMapper.toResponse(
                information
        );
    }

    // =========================================================
    // GET BY PRODUCT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductInformationResponse getInformationByProductId(
            Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }

        ProductInformationEntity information =
                productInformationRepository
                        .findByProductEntity_Id(productId)
                        .orElseThrow(() ->
                                new ProductInformationNotFoundException(
                                        "Product information not found for product id: "
                                                + productId
                                )
                        );

        return productInformationMapper.toResponse(
                information
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Override
    public ProductInformationResponse updateInformation(
            Long id,
            ProductInformationUpdateRequest request) {

        ProductInformationEntity information =
                productInformationRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductInformationNotFoundException(
                                        "Product information not found with id: "
                                                + id
                                )
                        );

        productInformationMapper.updateEntity(
                request,
                information
        );

        ProductInformationEntity updatedInformation =
                productInformationRepository.save(
                        information
                );

        return productInformationMapper.toResponse(
                updatedInformation
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteInformation(Long id) {

        ProductInformationEntity information =
                productInformationRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductInformationNotFoundException(
                                        "Product information not found with id: "
                                                + id
                                )
                        );

        productInformationRepository.delete(information);
    }
}