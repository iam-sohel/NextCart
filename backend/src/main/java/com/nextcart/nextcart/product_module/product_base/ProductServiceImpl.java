package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.brand_module.entity.Brand;
import com.nextcart.nextcart.brand_module.entity.BrandStatus;
import com.nextcart.nextcart.brand_module.repository.BrandRepository;

import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.category_module.entity.CategoryStatus;
import com.nextcart.nextcart.category_module.repository.CategoryRepository;

import com.nextcart.nextcart.inventory_module.InventoryEntity;
import com.nextcart.nextcart.inventory_module.InventoryRepository;

import com.nextcart.nextcart.product_module.exceptions.ProductAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductValidationException;

import com.nextcart.nextcart.product_module.productImage.ProductImageEntity;
import com.nextcart.nextcart.product_module.productImage.ProductImageRepository;
import com.nextcart.nextcart.product_module.productImage.productImageDTO.ProductImageResponse;

import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceResponse;

import com.nextcart.nextcart.product_module.productSpecification.ProductSpecification;
import com.nextcart.nextcart.product_module.productSpecification.ProductSpecificationRepository;
import com.nextcart.nextcart.product_module.productSpecification.productSpecification.ProductSpecificationResponse;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantStatus;
import com.nextcart.nextcart.product_module.productVariant.dto.ProductVariantResponse;

import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;

import com.nextcart.nextcart.product_module.variantAttribute.VariantAttributeEntity;
import com.nextcart.nextcart.product_module.variantAttribute.VariantAttributeRepository;
import com.nextcart.nextcart.product_module.variantAttribute.dto.VariantAttributeResponse;

import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.entity.SubCategoryStatus;
import com.nextcart.nextcart.subcategory_module.repository.SubCategoryRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    private final ProductVariantPriceRepository productVariantPriceRepository;

    private final VariantAttributeRepository variantAttributeRepository;

    private final InventoryRepository inventoryRepository;

    private final ProductSpecificationRepository productSpecificationRepository;

    private final ProductImageRepository productImageRepository;


    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    @Override
    public ProductResponse createProduct(ProductCreateRequest request) {

        validateSlugForCreate(request.getSlug());

        Category category = getActiveCategory(request.getCategoryId());

        SubCategory subCategory =
                getActiveSubCategory(request.getSubCategoryId());

        validateSubCategoryBelongsToCategory(
                subCategory,
                category
        );

        Brand brand = getActiveBrand(request.getBrandId());

        ProductEntity product = productMapper.toEntity(request);

        product.setCategory(category);
        product.setSubCategory(subCategory);
        product.setBrand(brand);

        ProductEntity savedProduct =
                productRepository.save(product);

        return productMapper.toResponse(savedProduct);
    }


    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {

        ProductEntity product =
                getActiveProductById(id);

        return productMapper.toResponse(product);
    }


    // =========================================================
    // GET PRODUCT BY SLUG
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {

        ProductEntity product =
                getActiveProductBySlug(slug);

        return productMapper.toResponse(product);
    }


    // =========================================================
    // COMPLETE PRODUCT DETAILS BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductDetailsResponse getProductDetailsById(Long id) {

        ProductEntity product =
                getActiveProductById(id);

        return buildProductDetails(product);
    }


    // =========================================================
    // COMPLETE PRODUCT DETAILS BY SLUG
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductDetailsResponse getProductDetailsBySlug(String slug) {

        ProductEntity product =
                getActiveProductBySlug(slug);

        return buildProductDetails(product);
    }


    // =========================================================
    // BUILD COMPLETE PRODUCT DETAILS
    // =========================================================

    private ProductDetailsResponse buildProductDetails(
            ProductEntity product
    ) {

        Long productId = product.getId();


        // =====================================================
        // SPECIFICATIONS
        // =====================================================

        List<ProductSpecificationResponse> specifications =
                productSpecificationRepository
                        .findByProductEntity_IdOrderBySpecificationNameAsc(
                                productId
                        )
                        .stream()
                        .map(this::toSpecificationResponse)
                        .toList();


        // =====================================================
        // IMAGES
        // =====================================================

        List<ProductImageResponse> images =
                productImageRepository
                        .findByProductEntity_IdOrderByDisplayOrderAsc(
                                productId
                        )
                        .stream()
                        .map(this::toImageResponse)
                        .toList();


        // =====================================================
        // ACTIVE VARIANTS
        // =====================================================

        List<ProductVariantEntity> variants =
                productVariantRepository
                        .findByProductEntity_Id(productId)
                        .stream()
                        .filter(variant ->
                                variant.getStatus()
                                        == ProductVariantStatus.ACTIVE
                        )
                        .toList();


        // =====================================================
        // VARIANT IDS
        // =====================================================

        List<Long> variantIds =
                variants.stream()
                        .map(ProductVariantEntity::getId)
                        .toList();


        // =====================================================
        // BATCH LOAD ATTRIBUTES
        // =====================================================

        Map<Long, List<VariantAttributeEntity>>
                attributesByVariantId;

        if (variantIds.isEmpty()) {

            attributesByVariantId =
                    Collections.emptyMap();

        } else {

            attributesByVariantId =
                    variantAttributeRepository
                            .findByVariantIdInOrderByAttributeNameAsc(
                                    variantIds
                            )
                            .stream()
                            .collect(
                                    Collectors.groupingBy(
                                            attribute ->
                                                    attribute
                                                            .getVariant()
                                                            .getId()
                                    )
                            );
        }


        // =====================================================
        // BUILD VARIANT RESPONSES
        // =====================================================

        List<ProductVariantResponse> variantResponses =
                variants.stream()
                        .map(variant -> {

                            Long variantId =
                                    variant.getId();


                            // ---------------------------------
                            // ATTRIBUTES
                            // ---------------------------------

                            List<VariantAttributeResponse>
                                    attributes =
                                    attributesByVariantId
                                            .getOrDefault(
                                                    variantId,
                                                    Collections.emptyList()
                                            )
                                            .stream()
                                            .map(
                                                    this::toAttributeResponse
                                            )
                                            .toList();


                            // ---------------------------------
                            // PRICE
                            // ---------------------------------

                            ProductVariantPriceResponse price =
                                    productVariantPriceRepository
                                            .findByProductVariantId(
                                                    variantId
                                            )
                                            .map(
                                                    this::toPriceResponse
                                            )
                                            .orElse(null);


                            // ---------------------------------
                            // INVENTORY
                            // ---------------------------------

                            InventoryEntity inventory =
                                    inventoryRepository
                                            .findByProductVariantId(
                                                    variantId
                                            )
                                            .orElse(null);


                            // ---------------------------------
                            // STOCK STATUS
                            // ---------------------------------

                            String stockStatus =
                                    calculateStockStatus(
                                            inventory
                                    );


                            // ---------------------------------
                            // AVAILABLE
                            // ---------------------------------

                            boolean available =
                                    isAvailable(
                                            inventory
                                    );


                            // ---------------------------------
                            // RESPONSE
                            // ---------------------------------

                            return ProductVariantResponse
                                    .builder()
                                    .id(variantId)
                                    .productId(productId)
                                    .sku(variant.getSku())
                                    .status(variant.getStatus())
                                    .attributes(attributes)
                                    .price(price)
                                    .stockStatus(stockStatus)
                                    .available(available)
                                    .build();

                        })
                        .toList();


        // =====================================================
        // FINAL PRODUCT DETAILS RESPONSE
        // =====================================================

        return ProductDetailsResponse
                .builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .categoryId(
                        product.getCategory().getId()
                )
                .subCategoryId(
                        product.getSubCategory().getId()
                )
                .brandId(
                        product.getBrand().getId()
                )
                .information(null)
                .specifications(specifications)
                .images(images)
                .variants(variantResponses)
                .build();
    }


    // =========================================================
    // STOCK STATUS
    // =========================================================

    private String calculateStockStatus(
            InventoryEntity inventory
    ) {

        if (inventory == null) {
            return "OUT_OF_STOCK";
        }

        Integer availableStock =
                inventory.getAvailableStock();

        if (availableStock == null ||
                availableStock <= 0) {

            return "OUT_OF_STOCK";
        }

        if (availableStock <= 5) {
            return "LOW_STOCK";
        }

        return "IN_STOCK";
    }


    // =========================================================
    // AVAILABLE
    // =========================================================

    private boolean isAvailable(
            InventoryEntity inventory
    ) {

        return inventory != null
                && inventory.getAvailableStock() != null
                && inventory.getAvailableStock() > 0;
    }


    // =========================================================
    // IMAGE MAPPING
    // =========================================================

    private ProductImageResponse toImageResponse(
            ProductImageEntity image
    ) {

        return ProductImageResponse
                .builder()
                .id(image.getId())
                .productId(
                        image.getProductEntity().getId()
                )
                .imageUrl(
                        image.getImageUrl()
                )
                .isPrimary(
                        image.getIsPrimary()
                )
                .displayOrder(
                        image.getDisplayOrder()
                )
                .build();
    }


    // =========================================================
    // SPECIFICATION MAPPING
    // =========================================================

    private ProductSpecificationResponse
    toSpecificationResponse(
            ProductSpecification specification
    ) {

        return ProductSpecificationResponse
                .builder()
                .id(specification.getId())
                .productId(
                        specification
                                .getProductEntity()
                                .getId()
                )
                .specificationName(
                        specification
                                .getSpecificationName()
                )
                .specificationValue(
                        specification
                                .getSpecificationValue()
                )
                .build();
    }


    // =========================================================
    // ATTRIBUTE MAPPING
    // =========================================================

    private VariantAttributeResponse
    toAttributeResponse(
            VariantAttributeEntity attribute
    ) {

        return VariantAttributeResponse
                .builder()
                .id(attribute.getId())
                .variantId(
                        attribute
                                .getVariant()
                                .getId()
                )
                .attributeName(
                        attribute
                                .getAttributeName()
                )
                .attributeValue(
                        attribute
                                .getAttributeValue()
                )
                .build();
    }


    // =========================================================
    // PRICE MAPPING
    // =========================================================

    private ProductVariantPriceResponse
    toPriceResponse(
            ProductVariantPriceEntity price
    ) {

        return ProductVariantPriceResponse
                .builder()
                .id(price.getId())
                .productVariantId(
                        price
                                .getProductVariant()
                                .getId()
                )
                .mrp(price.getMrp())
                .sellingPrice(
                        price.getSellingPrice()
                )
                .currency(
                        price.getCurrency()
                )
                .build();
    }


    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(
            Pageable pageable
    ) {

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
            Pageable pageable
    ) {

        getActiveCategory(categoryId);

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
            Pageable pageable
    ) {

        getActiveSubCategory(subCategoryId);

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
            Pageable pageable
    ) {

        getActiveBrand(brandId);

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
            ProductUpdateRequest request
    ) {

        ProductEntity product =
                productRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new ProductNotFoundException(
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
                product
        );


        product.setCategory(category);

        product.setSubCategory(subCategory);

        product.setBrand(brand);


        ProductEntity updated =
                productRepository.save(product);


        return productMapper.toResponse(updated);
    }


    // =========================================================
    // DEACTIVATE PRODUCT
    // =========================================================

    @Override
    public void deactivateProduct(Long id) {

        ProductEntity product =
                productRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new ProductNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );


        if (product.getStatus() ==
                ProductStatus.INACTIVE) {

            throw new ProductValidationException(
                    "Product is already inactive"
            );
        }


        product.setStatus(
                ProductStatus.INACTIVE
        );
    }


    // =========================================================
    // RESTORE PRODUCT
    // =========================================================

    @Override
    public ProductResponse restoreProduct(Long id) {

        ProductEntity product =
                productRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new ProductNotFoundException(
                                        "Product not found with id: "
                                                + id
                                )
                        );


        if (product.getStatus() ==
                ProductStatus.ACTIVE) {

            throw new ProductValidationException(
                    "Product is already active"
            );
        }


        validateRestoreDependencies(product);


        product.setStatus(
                ProductStatus.ACTIVE
        );


        return productMapper.toResponse(product);
    }


    // =========================================================
    // GET ACTIVE PRODUCT BY ID
    // =========================================================

    private ProductEntity getActiveProductById(
            Long id
    ) {

        if (id == null) {

            throw new ProductValidationException(
                    "Product id is required"
            );
        }


        return productRepository
                .findByIdAndStatus(
                        id,
                        ProductStatus.ACTIVE
                )
                .orElseThrow(
                        () -> new ProductNotFoundException(
                                "Product not found with id: "
                                        + id
                        )
                );
    }


    // =========================================================
    // GET ACTIVE PRODUCT BY SLUG
    // =========================================================

    private ProductEntity getActiveProductBySlug(
            String slug
    ) {

        if (slug == null ||
                slug.isBlank()) {

            throw new ProductValidationException(
                    "Product slug is required"
            );
        }


        String normalizedSlug =
                slug.trim();


        return productRepository
                .findBySlugIgnoreCaseAndStatus(
                        normalizedSlug,
                        ProductStatus.ACTIVE
                )
                .orElseThrow(
                        () -> new ProductNotFoundException(
                                "Product not found with slug: "
                                        + normalizedSlug
                        )
                );
    }


    // =========================================================
    // VALIDATE CREATE SLUG
    // =========================================================

    private void validateSlugForCreate(
            String slug
    ) {

        if (slug == null ||
                slug.isBlank()) {

            throw new ProductValidationException(
                    "Product slug is required"
            );
        }


        String normalizedSlug =
                slug.trim();


        if (productRepository
                .existsBySlugIgnoreCase(
                        normalizedSlug
                )) {

            throw new ProductAlreadyExistsException(
                    "Product slug already exists: "
                            + normalizedSlug
            );
        }
    }


    // =========================================================
    // VALIDATE UPDATE SLUG
    // =========================================================

    private void validateSlugForUpdate(
            String slug,
            Long productId
    ) {

        if (slug == null ||
                slug.isBlank()) {

            throw new ProductValidationException(
                    "Product slug is required"
            );
        }


        String normalizedSlug =
                slug.trim();


        if (productRepository
                .existsBySlugIgnoreCaseAndIdNot(
                        normalizedSlug,
                        productId
                )) {

            throw new ProductAlreadyExistsException(
                    "Product slug already exists: "
                            + normalizedSlug
            );
        }
    }


    // =========================================================
    // GET ACTIVE CATEGORY
    // =========================================================

    private Category getActiveCategory(
            Long categoryId
    ) {

        if (categoryId == null) {

            throw new ProductValidationException(
                    "Category id is required"
            );
        }


        return categoryRepository
                .findByIdAndStatus(
                        categoryId,
                        CategoryStatus.ACTIVE
                )
                .orElseThrow(
                        () -> new ProductValidationException(
                                "Active category not found with id: "
                                        + categoryId
                        )
                );
    }


    // =========================================================
    // GET ACTIVE SUBCATEGORY
    // =========================================================

    private SubCategory getActiveSubCategory(
            Long subCategoryId
    ) {

        if (subCategoryId == null) {

            throw new ProductValidationException(
                    "SubCategory id is required"
            );
        }


        return subCategoryRepository
                .findByIdAndStatus(
                        subCategoryId,
                        SubCategoryStatus.ACTIVE
                )
                .orElseThrow(
                        () -> new ProductValidationException(
                                "Active subcategory not found with id: "
                                        + subCategoryId
                        )
                );
    }


    // =========================================================
    // GET ACTIVE BRAND
    // =========================================================

    private Brand getActiveBrand(
            Long brandId
    ) {

        if (brandId == null) {

            throw new ProductValidationException(
                    "Brand id is required"
            );
        }


        return brandRepository
                .findByIdAndStatus(
                        brandId,
                        BrandStatus.ACTIVE
                )
                .orElseThrow(
                        () -> new ProductValidationException(
                                "Active brand not found with id: "
                                        + brandId
                        )
                );
    }


    // =========================================================
    // SUBCATEGORY → CATEGORY VALIDATION
    // =========================================================

    private void validateSubCategoryBelongsToCategory(
            SubCategory subCategory,
            Category category
    ) {

        if (subCategory == null ||
                category == null) {

            throw new ProductValidationException(
                    "Category and subcategory are required"
            );
        }


        if (subCategory.getCategory() == null ||
                subCategory.getCategory().getId() == null ||
                !subCategory.getCategory()
                        .getId()
                        .equals(category.getId())) {

            throw new ProductValidationException(
                    "SubCategory does not belong to the selected category"
            );
        }
    }


    // =========================================================
    // RESTORE DEPENDENCIES
    // =========================================================

    private void validateRestoreDependencies(
            ProductEntity product
    ) {

        if (product.getCategory() == null) {

            throw new ProductValidationException(
                    "Product category is missing"
            );
        }


        if (product.getSubCategory() == null) {

            throw new ProductValidationException(
                    "Product subcategory is missing"
            );
        }


        if (product.getBrand() == null) {

            throw new ProductValidationException(
                    "Product brand is missing"
            );
        }


        getActiveCategory(
                product.getCategory().getId()
        );


        getActiveSubCategory(
                product.getSubCategory().getId()
        );


        getActiveBrand(
                product.getBrand().getId()
        );


        validateSubCategoryBelongsToCategory(
                product.getSubCategory(),
                product.getCategory()
        );
    }
}