package com.nextcart.nextcart.product_module.productVariant;

import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantCreateRequest;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantResponse;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantUpdateRequest;
import com.nextcart.nextcart.product_module.product_base.ProductEntity;

import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantNotFoundException;
import com.nextcart.nextcart.product_module.product_base.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ProductVariantMapper productVariantMapper;

    @Override
    public ProductVariantResponse createVariant(
            ProductVariantCreateRequest request) {

        ProductEntity productEntity = productRepository.findById(
                request.getProductId()
        ).orElseThrow(() ->
                new ProductNotFoundException(
                        "Product not found with id: "
                                + request.getProductId()
                )
        );

        String sku = request.getSku().trim();

        if (productVariantRepository.existsBySkuIgnoreCase(sku)) {
            throw new ProductVariantAlreadyExistsException(
                    "Variant with SKU already exists: " + sku
            );
        }

        ProductVariantEntity variant =
                productVariantMapper.toEntity(request);

        variant.setProductEntity(productEntity);

        ProductVariantEntity savedVariant =
                productVariantRepository.save(variant);

        return productVariantMapper.toResponse(savedVariant);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantResponse getVariantById(Long id) {

        ProductVariantEntity variant =
                productVariantRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + id
                                )
                        );

        return productVariantMapper.toResponse(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantResponse getVariantBySku(
            String sku) {

        ProductVariantEntity variant =
                productVariantRepository
                        .findBySkuIgnoreCase(sku.trim())
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with SKU: "
                                                + sku
                                )
                        );

        return productVariantMapper.toResponse(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductVariantResponse> getVariantsByProduct(
            Long productId,
            Pageable pageable) {

        validateProductExists(productId);

        return productVariantRepository
                .findByProductId(productId, pageable)
                .map(productVariantMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductVariantResponse> getActiveVariantsByProduct(
            Long productId,
            Pageable pageable) {

        validateProductExists(productId);

        return productVariantRepository
                .findByProductIdAndStatus(
                        productId,
                        ProductVariantStatus.ACTIVE,
                        pageable
                )
                .map(productVariantMapper::toResponse);
    }

    @Override
    public ProductVariantResponse updateVariant(
            Long id,
            ProductVariantUpdateRequest request) {

        ProductVariantEntity variant =
                productVariantRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + id
                                )
                        );

        String sku = request.getSku().trim();

        if (productVariantRepository
                .existsBySkuIgnoreCaseAndIdNot(sku, id)) {

            throw new ProductVariantAlreadyExistsException(
                    "Variant with SKU already exists: " + sku
            );
        }

        productVariantMapper.updateEntity(
                request,
                variant
        );

        ProductVariantEntity updatedVariant =
                productVariantRepository.save(variant);

        return productVariantMapper.toResponse(updatedVariant);
    }

    @Override
    public void deactivateVariant(Long id) {

        ProductVariantEntity variant =
                productVariantRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + id
                                )
                        );

        variant.setStatus(ProductVariantStatus.INACTIVE);

        productVariantRepository.save(variant);
    }

    @Override
    public ProductVariantResponse restoreVariant(Long id) {

        ProductVariantEntity variant =
                productVariantRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + id
                                )
                        );

        variant.setStatus(ProductVariantStatus.ACTIVE);

        ProductVariantEntity restoredVariant =
                productVariantRepository.save(variant);

        return productVariantMapper.toResponse(restoredVariant);
    }

    private void validateProductExists(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException(
                    "Product not found with id: " + productId
            );
        }
    }
}