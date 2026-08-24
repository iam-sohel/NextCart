package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.brand_module.entity.Brand;
import com.nextcart.nextcart.brand_module.entity.BrandStatus;
import com.nextcart.nextcart.brand_module.repository.BrandRepository;
import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.category_module.entity.CategoryStatus;
import com.nextcart.nextcart.category_module.repository.CategoryRepository;
import com.nextcart.nextcart.product_module.product_base.dto.ProductCreateRequest;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductUpdateRequest;
import com.nextcart.nextcart.product_module.exceptions.ProductAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductValidationException;
import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.entity.SubCategoryStatus;
import com.nextcart.nextcart.subcategory_module.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final BrandRepository brandRepository;

    @Override
    public ProductResponse createProduct(
            ProductCreateRequest request) {

        // 1. Validate slug uniqueness
        validateSlugForCreate(request.getSlug());

        // 2. Validate category
        Category category = getActiveCategory(
                request.getCategoryId()
        );

        // 3. Validate subcategory
        SubCategory subCategory = getActiveSubCategory(
                request.getSubCategoryId()
        );

        // 4. Validate category-subcategory relationship
        validateSubCategoryBelongsToCategory(
                subCategory,
                category
        );

        // 5. Validate brand
        Brand brand = getActiveBrand(
                request.getBrandId()
        );

        // 6. Map request
        ProductEntity product =
                productMapper.toEntity(request);

        // 7. Set relationships
        product.setCategory(category);
        product.setSubCategory(subCategory);
        product.setBrand(brand);

        // 8. Save
        ProductEntity savedProduct =
                productRepository.save(product);

        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {

        ProductEntity productEntity = productRepository
                .findByIdAndStatus(
                        id,
                        ProductStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        return productMapper.toResponse(productEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {

        ProductEntity productEntity = productRepository
                .findBySlugIgnoreCaseAndStatus(
                        slug,
                        ProductStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with slug: " + slug
                        )
                );

        return productMapper.toResponse(productEntity);
    }

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

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(
            Long categoryId,
            Pageable pageable) {

        // Validate that category itself is active
        getActiveCategory(categoryId);

        return productRepository
                .findAllByCategoryIdAndStatus(
                        categoryId,
                        ProductStatus.ACTIVE,
                        pageable
                )
                .map(productMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsBySubCategory(
            Long subCategoryId,
            Pageable pageable) {

        // Validate that subcategory itself is active
        getActiveSubCategory(subCategoryId);

        return productRepository
                .findAllBySubCategoryIdAndStatus(
                        subCategoryId,
                        ProductStatus.ACTIVE,
                        pageable
                )
                .map(productMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByBrand(
            Long brandId,
            Pageable pageable) {

        // Validate that brand itself is active
        getActiveBrand(brandId);

        return productRepository
                .findAllByBrandIdAndStatus(
                        brandId,
                        ProductStatus.ACTIVE,
                        pageable
                )
                .map(productMapper::toResponse);
    }

    @Override
    public ProductResponse updateProduct(
            Long id,
            ProductUpdateRequest request) {

        // 1. Find existing product
        ProductEntity productEntity = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        // 2. Validate slug uniqueness
        validateSlugForUpdate(
                request.getSlug(),
                id
        );

        // 3. Validate category
        Category category = getActiveCategory(
                request.getCategoryId()
        );

        // 4. Validate subcategory
        SubCategory subCategory =
                getActiveSubCategory(
                        request.getSubCategoryId()
                );

        // 5. Validate category-subcategory relationship
        validateSubCategoryBelongsToCategory(
                subCategory,
                category
        );

        // 6. Validate brand
        Brand brand = getActiveBrand(
                request.getBrandId()
        );

        // 7. Update basic fields
        productMapper.updateEntity(
                request,
                productEntity
        );

        // 8. Update slug
        productEntity.setSlug(request.getSlug());

        // 9. Update relationships
        productEntity.setCategory(category);
        productEntity.setSubCategory(subCategory);
        productEntity.setBrand(brand);

        // 10. Save
        ProductEntity updatedProduct =
                productRepository.save(productEntity);

        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public void deactivateProduct(Long id) {

        ProductEntity productEntity = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        if (productEntity.getStatus() == ProductStatus.INACTIVE) {
            throw new ProductValidationException(
                    "Product is already inactive"
            );
        }

        productEntity.setStatus(ProductStatus.INACTIVE);

        productRepository.save(productEntity);
    }

    @Override
    public ProductResponse restoreProduct(Long id) {

        ProductEntity productEntity = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        if (productEntity.getStatus() == ProductStatus.ACTIVE) {
            throw new ProductValidationException(
                    "Product is already active"
            );
        }

        // Before restoring, make sure its dependencies
        // are still active.
        validateRestoreDependencies(productEntity);

        productEntity.setStatus(ProductStatus.ACTIVE);

        ProductEntity restoredProduct =
                productRepository.save(productEntity);

        return productMapper.toResponse(restoredProduct);
    }

    // ---------------------------------------------------------
    // Private validation methods
    // ---------------------------------------------------------

    private void validateSlugForCreate(String slug) {

        if (productRepository.existsBySlugIgnoreCase(slug)) {
            throw new ProductAlreadyExistsException(
                    "Product slug already exists: " + slug
            );
        }
    }

    private void validateSlugForUpdate(
            String slug,
            Long productId) {

        if (productRepository
                .existsBySlugIgnoreCaseAndIdNot(
                        slug,
                        productId
                )) {

            throw new ProductAlreadyExistsException(
                    "Product slug already exists: " + slug
            );
        }
    }

    private Category getActiveCategory(Long categoryId) {

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

    private Brand getActiveBrand(Long brandId) {

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

    private void validateRestoreDependencies(
            ProductEntity productEntity) {

        getActiveCategory(
                productEntity.getCategory().getId()
        );

        getActiveSubCategory(
                productEntity.getSubCategory().getId()
        );

        getActiveBrand(
                productEntity.getBrand().getId()
        );

        validateSubCategoryBelongsToCategory(
                productEntity.getSubCategory(),
                productEntity.getCategory()
        );
    }
}