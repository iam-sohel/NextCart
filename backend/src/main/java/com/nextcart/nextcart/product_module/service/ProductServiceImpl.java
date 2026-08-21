package com.nextcart.nextcart.product_module.service;

import com.nextcart.nextcart.brand_module.entity.Brand;
import com.nextcart.nextcart.brand_module.exceptions.BrandNotFoundException;
import com.nextcart.nextcart.brand_module.repository.BrandRepository;

import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.category_module.exceptions.CategoryNotFoundException;
import com.nextcart.nextcart.category_module.repository.CategoryRepository;

import com.nextcart.nextcart.product_module.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.dto.ProductVariant.ProductVariantResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductCreateRequest;
import com.nextcart.nextcart.product_module.dto.product.ProductResponse;
import com.nextcart.nextcart.product_module.dto.product.ProductUpdateRequest;
import com.nextcart.nextcart.product_module.dto.productImage.ProductImageResponse;
import com.nextcart.nextcart.product_module.dto.productSpecification.ProductSpecificationResponse;
import com.nextcart.nextcart.product_module.dto.product_information.ProductInformationResponseDTO;
import com.nextcart.nextcart.product_module.entity.Product;
import com.nextcart.nextcart.product_module.entity.VariantAttribute;
import com.nextcart.nextcart.product_module.exceptions.ProductAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductNotFoundException;
import com.nextcart.nextcart.product_module.mapper.ProductMapper;
import com.nextcart.nextcart.product_module.repository.*;

import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.exceptions.SubCategoryNotFoundException;
import com.nextcart.nextcart.subcategory_module.repository.SubCategoryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final BrandRepository brandRepository;
    private final ProductMapper productMapper;
    private final ProductInformationRepository productInformationRepository;
    private final ProductSpecificationRepository productSpecificationRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final VariantAttributeRepository variantAttributeRepository;

    // =========================
    // CREATE PRODUCT
    // =========================

    @Override
    public ProductResponse createProduct(
            ProductCreateRequest request) {

        Category category = categoryRepository.findById(
                request.getCategoryId()
        ).orElseThrow(() ->
                new CategoryNotFoundException(
                        "Category not found with id: "
                                + request.getCategoryId()
                )
        );

        SubCategory subCategory = subCategoryRepository.findById(
                request.getSubCategoryId()
        ).orElseThrow(() ->
                new SubCategoryNotFoundException(
                        "SubCategory not found with id: "
                                + request.getSubCategoryId()
                )
        );

        Brand brand = brandRepository.findById(
                request.getBrandId()
        ).orElseThrow(() ->
                new BrandNotFoundException(
                        "Brand not found with id: "
                                + request.getBrandId()
                )
        );

        // Validate SubCategory belongs to Category
        if (!subCategory.getCategory().getId()
                .equals(category.getId())) {

            throw new IllegalArgumentException(
                    "SubCategory does not belong to the selected Category"
            );
        }

        // Check duplicate product name
        if (productRepository.existsByNameIgnoreCase(
                request.getName())) {

            throw new ProductAlreadyExistsException(
                    "Product already exists: "
                            + request.getName()
            );
        }

        // Check duplicate slug
        if (productRepository.existsBySlugIgnoreCase(
                request.getSlug())) {

            throw new ProductAlreadyExistsException(
                    "Product slug already exists: "
                            + request.getSlug()
            );
        }

        Product product = productMapper.toEntity(
                request,
                category,
                subCategory,
                brand
        );

        Product savedProduct =
                productRepository.save(product);

        return productMapper.toResponse(savedProduct);
    }


    // =========================
    // GET PRODUCT BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        return productMapper.toResponse(product);
    }


    // =========================
    // GET ALL PRODUCTS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }


    // =========================
    // GET PRODUCTS BY CATEGORY
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(
            Long categoryId) {

        // Validate category exists
        categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: "
                                        + categoryId
                        )
                );

        return productRepository
                .findByCategoryId(categoryId)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }


    // =========================
    // GET PRODUCTS BY SUBCATEGORY
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySubCategory(
            Long subCategoryId) {

        // Validate subcategory exists
        subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() ->
                        new SubCategoryNotFoundException(
                                "SubCategory not found with id: "
                                        + subCategoryId
                        )
                );

        return productRepository
                .findBySubCategoryId(subCategoryId)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }


    // =========================
    // SEARCH PRODUCTS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(
            String keyword) {

        if (keyword == null || keyword.isBlank()) {
            return getAllProducts();
        }

        return productRepository
                .findByNameContainingIgnoreCase(keyword.trim())
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }


    // =========================
    // FILTER PRODUCTS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> filterProducts(
            Long categoryId,
            Long subCategoryId,
            String keyword) {

        boolean hasCategory =
                categoryId != null;

        boolean hasSubCategory =
                subCategoryId != null;

        boolean hasKeyword =
                keyword != null && !keyword.isBlank();


        // Category + SubCategory + Search
        if (hasCategory
                && hasSubCategory
                && hasKeyword) {

            return productRepository
                    .findByCategoryIdAndSubCategoryIdAndNameContainingIgnoreCase(
                            categoryId,
                            subCategoryId,
                            keyword.trim()
                    )
                    .stream()
                    .map(productMapper::toResponse)
                    .toList();
        }


        // Category + SubCategory
        if (hasCategory && hasSubCategory) {

            return productRepository
                    .findByCategoryIdAndSubCategoryId(
                            categoryId,
                            subCategoryId
                    )
                    .stream()
                    .map(productMapper::toResponse)
                    .toList();
        }


        // Category + Search
        if (hasCategory && hasKeyword) {

            return productRepository
                    .findByCategoryIdAndNameContainingIgnoreCase(
                            categoryId,
                            keyword.trim()
                    )
                    .stream()
                    .map(productMapper::toResponse)
                    .toList();
        }


        // SubCategory + Search
        if (hasSubCategory && hasKeyword) {

            return productRepository
                    .findBySubCategoryIdAndNameContainingIgnoreCase(
                            subCategoryId,
                            keyword.trim()
                    )
                    .stream()
                    .map(productMapper::toResponse)
                    .toList();
        }


        // Only Category
        if (hasCategory) {

            return getProductsByCategory(categoryId);
        }


        // Only SubCategory
        if (hasSubCategory) {

            return getProductsBySubCategory(subCategoryId);
        }


        // Only Search
        if (hasKeyword) {

            return searchProducts(keyword);
        }


        // No filters
        return getAllProducts();
    }


    // =========================
    // UPDATE PRODUCT
    // =========================

    @Override
    public ProductResponse updateProduct(
            Long id,
            ProductUpdateRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        Category category = categoryRepository.findById(
                request.getCategoryId()
        ).orElseThrow(() ->
                new CategoryNotFoundException(
                        "Category not found with id: "
                                + request.getCategoryId()
                )
        );

        SubCategory subCategory = subCategoryRepository.findById(
                request.getSubCategoryId()
        ).orElseThrow(() ->
                new SubCategoryNotFoundException(
                        "SubCategory not found with id: "
                                + request.getSubCategoryId()
                )
        );

        Brand brand = brandRepository.findById(
                request.getBrandId()
        ).orElseThrow(() ->
                new BrandNotFoundException(
                        "Brand not found with id: "
                                + request.getBrandId()
                )
        );

        // Validate relationship
        if (!subCategory.getCategory().getId()
                .equals(category.getId())) {

            throw new IllegalArgumentException(
                    "SubCategory does not belong to the selected Category"
            );
        }

        // Duplicate name check
        if (!product.getName().equalsIgnoreCase(
                request.getName())
                && productRepository.existsByNameIgnoreCase(
                request.getName())) {

            throw new ProductAlreadyExistsException(
                    "Product already exists: "
                            + request.getName()
            );
        }

        // Duplicate slug check
        if (!product.getSlug().equalsIgnoreCase(
                request.getSlug())
                && productRepository.existsBySlugIgnoreCase(
                request.getSlug())) {

            throw new ProductAlreadyExistsException(
                    "Product slug already exists: "
                            + request.getSlug()
            );
        }

        productMapper.updateEntity(
                request,
                category,
                subCategory,
                brand,
                product
        );

        Product updatedProduct =
                productRepository.save(product);

        return productMapper.toResponse(updatedProduct);
    }


    // =========================
    // DELETE PRODUCT
    // =========================

    @Override
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailsResponse getProductDetails(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId
                        )
                );

        ProductInformationResponseDTO information =
                productInformationRepository.findByProductId(productId)
                        .map(info -> ProductInformationResponseDTO.builder()
                                .id(info.getId())
                                .productId(productId)
                                .shortDescription(info.getShortDescription())
                                .longDescription(info.getLongDescription())
                                .warranty(info.getWarranty())
                                .manufacturer(info.getManufacturer())
                                .build())
                        .orElse(null);

        List<ProductSpecificationResponse> specifications =
                productSpecificationRepository.findByProductId(productId)
                        .stream()
                        .map(spec -> ProductSpecificationResponse.builder()
                                .id(spec.getId())
                                .productId(productId)
                                .specificationName(spec.getSpecificationName())
                                .specificationValue(spec.getSpecificationValue())
                                .build())
                        .toList();

        List<ProductImageResponse> images =
                productImageRepository
                        .findByProductIdOrderByDisplayOrderAsc(productId)
                        .stream()
                        .map(image -> ProductImageResponse.builder()
                                .id(image.getId())
                                .productId(productId)
                                .imageUrl(image.getImageUrl())
                                .isPrimary(image.getIsPrimary())
                                .displayOrder(image.getDisplayOrder())
                                .build())
                        .toList();


        List<ProductVariantResponse> variants =
                productVariantRepository.findByProductId(productId)
                        .stream()
                        .map(variant -> {

                            Map<String, String> attributes =
                                    variantAttributeRepository
                                            .findByVariantId(variant.getId())
                                            .stream()
                                            .collect(Collectors.toMap(
                                                    VariantAttribute::getAttributeName,
                                                    VariantAttribute::getAttributeValue
                                            ));

                            return ProductVariantResponse.builder()
                                    .id(variant.getId())
                                    .productId(productId)
                                    .sku(variant.getSku())
                                    .price(variant.getPrice())
                                    .attributes(attributes)
                                    .build();
                        })
                        .toList();

        return ProductDetailsResponse.builder()
                .product(productMapper.toResponse(product))
                .information(information)
                .specifications(specifications)
                .variants(variants)
                .images(images)
                .build();
    }
}