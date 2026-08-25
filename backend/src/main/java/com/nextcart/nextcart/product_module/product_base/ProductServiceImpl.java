package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.brand_module.entity.Brand;
import com.nextcart.nextcart.brand_module.entity.BrandStatus;
import com.nextcart.nextcart.brand_module.repository.BrandRepository;

import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.category_module.entity.CategoryStatus;
import com.nextcart.nextcart.category_module.repository.CategoryRepository;

import com.nextcart.nextcart.product_module.exceptions.ProductAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductValidationException;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantResponse;

import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;

import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.entity.SubCategoryStatus;
import com.nextcart.nextcart.subcategory_module.repository.SubCategoryRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final BrandRepository brandRepository;

    private final ProductVariantRepository productVariantRepository;


    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    @Override
    public ProductResponse createProduct(
            ProductCreateRequest request) {

        validateSlugForCreate(
                request.getSlug()
        );

        Category category =
                getActiveCategory(
                        request.getCategoryId()
                );

        SubCategory subCategory =
                getActiveSubCategory(
                        request.getSubCategoryId()
                );

        validateSubCategoryBelongsToCategory(
                subCategory,
                category
        );

        Brand brand =
                getActiveBrand(
                        request.getBrandId()
                );

        ProductEntity product =
                productMapper.toEntity(request);

        product.setCategory(category);
        product.setSubCategory(subCategory);
        product.setBrand(brand);

        ProductEntity savedProduct =
                productRepository.save(product);

        return productMapper.toResponse(
                savedProduct
        );
    }


    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(
            Long id) {

        ProductEntity productEntity =
                productRepository.findByIdAndStatus(
                                id,
                                ProductStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        return productMapper.toResponse(
                productEntity
        );
    }


    // =========================================================
    // GET PRODUCT BY SLUG
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(
            String slug) {

        ProductEntity productEntity =
                productRepository
                        .findBySlugIgnoreCaseAndStatus(
                                slug,
                                ProductStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with slug: "
                                                + slug
                                )
                        );

        return productMapper.toResponse(
                productEntity
        );
    }


    // =========================================================
    // GET COMPLETE PRODUCT DETAILS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductDetailsResponse getProductDetailsById(
            Long id) {

        ProductEntity productEntity =
                productRepository.findByIdAndStatus(
                                id,
                                ProductStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        /*
         * IMPORTANT:
         *
         * ProductVariantEntity contains:
         *
         *     productEntity
         *
         * Therefore the repository method is:
         *
         *     findByProductEntity_Id(...)
         *
         * NOT:
         *
         *     findByProductId(...)
         */
        List<ProductVariantEntity> variants =
                productVariantRepository
                        .findByProductEntity_Id(id);


        /*
         * Map product variants.
         *
         * Inventory mapping is intentionally not performed here
         * until the actual InventoryEntity relationship is confirmed.
         */
        List<ProductVariantResponse> variantResponses =
                variants.stream()
                        .map(variant ->
                                ProductVariantResponse
                                        .builder()
                                        .id(
                                                variant.getId()
                                        )
                                        .productId(
                                                productEntity.getId()
                                        )
                                        .sku(
                                                variant.getSku()
                                        )
                                        .status(
                                                variant.getStatus()
                                        )
                                        .build()
                        )
                        .toList();


        return ProductDetailsResponse
                .builder()
                .id(
                        productEntity.getId()
                )
                .name(
                        productEntity.getName()
                )
                .slug(
                        productEntity.getSlug()
                )
                .description(
                        productEntity.getDescription()
                )
                .variants(
                        variantResponses
                )
                .build();
    }


    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(
            Pageable pageable) {

        return productRepository
                .findAllByStatus(
                        ProductStatus.ACTIVE,
                        pageable
                )
                .map(productMapper::toResponse);
    }


    // =========================================================
    // GET PRODUCTS BY CATEGORY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(
            Long categoryId,
            Pageable pageable) {

        getActiveCategory(
                categoryId
        );

        return productRepository
                .findAllByCategoryIdAndStatus(
                        categoryId,
                        ProductStatus.ACTIVE,
                        pageable
                )
                .map(productMapper::toResponse);
    }


    // =========================================================
    // GET PRODUCTS BY SUBCATEGORY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsBySubCategory(
            Long subCategoryId,
            Pageable pageable) {

        getActiveSubCategory(
                subCategoryId
        );

        return productRepository
                .findAllBySubCategoryIdAndStatus(
                        subCategoryId,
                        ProductStatus.ACTIVE,
                        pageable
                )
                .map(productMapper::toResponse);
    }


    // =========================================================
    // GET PRODUCTS BY BRAND
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByBrand(
            Long brandId,
            Pageable pageable) {

        getActiveBrand(
                brandId
        );

        return productRepository
                .findAllByBrandIdAndStatus(
                        brandId,
                        ProductStatus.ACTIVE,
                        pageable
                )
                .map(productMapper::toResponse);
    }


    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    @Override
    public ProductResponse updateProduct(
            Long id,
            ProductUpdateRequest request) {

        ProductEntity productEntity =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        validateSlugForUpdate(
                request.getSlug(),
                id
        );

        Category category =
                getActiveCategory(
                        request.getCategoryId()
                );

        SubCategory subCategory =
                getActiveSubCategory(
                        request.getSubCategoryId()
                );

        validateSubCategoryBelongsToCategory(
                subCategory,
                category
        );

        Brand brand =
                getActiveBrand(
                        request.getBrandId()
                );

        productMapper.updateEntity(
                request,
                productEntity
        );

        productEntity.setSlug(
                request.getSlug()
        );

        productEntity.setCategory(
                category
        );

        productEntity.setSubCategory(
                subCategory
        );

        productEntity.setBrand(
                brand
        );

        ProductEntity updatedProduct =
                productRepository.save(
                        productEntity
                );

        return productMapper.toResponse(
                updatedProduct
        );
    }


    // =========================================================
    // DEACTIVATE PRODUCT
    // =========================================================

    @Override
    public void deactivateProduct(
            Long id) {

        ProductEntity productEntity =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        if (productEntity.getStatus()
                == ProductStatus.INACTIVE) {

            throw new ProductValidationException(
                    "Product is already inactive"
            );
        }

        productEntity.setStatus(
                ProductStatus.INACTIVE
        );

        productRepository.save(
                productEntity
        );
    }


    // =========================================================
    // RESTORE PRODUCT
    // =========================================================

    @Override
    public ProductResponse restoreProduct(
            Long id) {

        ProductEntity productEntity =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );

        if (productEntity.getStatus()
                == ProductStatus.ACTIVE) {

            throw new ProductValidationException(
                    "Product is already active"
            );
        }

        validateRestoreDependencies(
                productEntity
        );

        productEntity.setStatus(
                ProductStatus.ACTIVE
        );

        ProductEntity restoredProduct =
                productRepository.save(
                        productEntity
                );

        return productMapper.toResponse(
                restoredProduct
        );
    }


    // =========================================================
    // VALIDATE CREATE SLUG
    // =========================================================

    private void validateSlugForCreate(
            String slug) {

        if (productRepository
                .existsBySlugIgnoreCase(slug)) {

            throw new ProductAlreadyExistsException(
                    "Product slug already exists: "
                            + slug
            );
        }
    }


    // =========================================================
    // VALIDATE UPDATE SLUG
    // =========================================================

    private void validateSlugForUpdate(
            String slug,
            Long productId) {

        if (productRepository
                .existsBySlugIgnoreCaseAndIdNot(
                        slug,
                        productId
                )) {

            throw new ProductAlreadyExistsException(
                    "Product slug already exists: "
                            + slug
            );
        }
    }


    // =========================================================
    // GET ACTIVE CATEGORY
    // =========================================================

    private Category getActiveCategory(
            Long categoryId) {

        return categoryRepository
                .findByIdAndStatus(
                        categoryId,
                        CategoryStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ProductValidationException(
                                "Active category not found with id: "
                                        + categoryId
                        )
                );
    }


    // =========================================================
    // GET ACTIVE SUBCATEGORY
    // =========================================================

    private SubCategory getActiveSubCategory(
            Long subCategoryId) {

        return subCategoryRepository
                .findByIdAndStatus(
                        subCategoryId,
                        SubCategoryStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ProductValidationException(
                                "Active subcategory not found with id: "
                                        + subCategoryId
                        )
                );
    }


    // =========================================================
    // GET ACTIVE BRAND
    // =========================================================

    private Brand getActiveBrand(
            Long brandId) {

        return brandRepository
                .findByIdAndStatus(
                        brandId,
                        BrandStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ProductValidationException(
                                "Active brand not found with id: "
                                        + brandId
                        )
                );
    }


    // =========================================================
    // VALIDATE CATEGORY / SUBCATEGORY
    // =========================================================

    private void validateSubCategoryBelongsToCategory(
            SubCategory subCategory,
            Category category) {

        if (subCategory.getCategory() == null
                || subCategory.getCategory().getId() == null
                || !subCategory.getCategory()
                .getId()
                .equals(category.getId())) {

            throw new ProductValidationException(
                    "SubCategory does not belong to the selected category"
            );
        }
    }


    // =========================================================
    // VALIDATE RESTORE DEPENDENCIES
    // =========================================================

    private void validateRestoreDependencies(
            ProductEntity productEntity) {

        getActiveCategory(
                productEntity
                        .getCategory()
                        .getId()
        );

        getActiveSubCategory(
                productEntity
                        .getSubCategory()
                        .getId()
        );

        getActiveBrand(
                productEntity
                        .getBrand()
                        .getId()
        );

        validateSubCategoryBelongsToCategory(
                productEntity.getSubCategory(),
                productEntity.getCategory()
        );
    }
}