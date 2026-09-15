package com.nextcart.nextcart.seller_module.product;

import com.nextcart.nextcart.brand_module.entity.Brand;
import com.nextcart.nextcart.brand_module.entity.BrandStatus;
import com.nextcart.nextcart.brand_module.repository.BrandRepository;
import com.nextcart.nextcart.category_module.entity.Category;
import com.nextcart.nextcart.category_module.entity.CategoryStatus;
import com.nextcart.nextcart.category_module.repository.CategoryRepository;
import com.nextcart.nextcart.product_module.productImage.ProductImageEntity;
import com.nextcart.nextcart.product_module.productImage.ProductImageRepository;
import com.nextcart.nextcart.product_module.productInformation.ProductInformationEntity;
import com.nextcart.nextcart.product_module.productInformation.ProductInformationRepository;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.product_module.productSpecification.ProductSpecification;
import com.nextcart.nextcart.product_module.productSpecification.ProductSpecificationRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantStatus;
import com.nextcart.nextcart.product_module.product_base.ProductEntity;
import com.nextcart.nextcart.product_module.product_base.ProductRepository;
import com.nextcart.nextcart.product_module.product_base.ProductStatus;
import com.nextcart.nextcart.product_module.variantAttribute.VariantAttributeEntity;
import com.nextcart.nextcart.product_module.variantAttribute.VariantAttributeRepository;
import com.nextcart.nextcart.seller_module.inventory_module.entity.Inventory;
import com.nextcart.nextcart.seller_module.inventory_module.entity.InventoryItem;
import com.nextcart.nextcart.seller_module.inventory_module.repository.InventoryItemRepository;
import com.nextcart.nextcart.seller_module.inventory_module.repository.InventoryRepository;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.Warehouse;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.WarehouseStatus;
import com.nextcart.nextcart.seller_module.warehouse_module.repository.WarehouseRepository;
import com.nextcart.nextcart.subcategory_module.entity.SubCategory;
import com.nextcart.nextcart.subcategory_module.entity.SubCategoryStatus;
import com.nextcart.nextcart.subcategory_module.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerProductServiceImpl implements SellerProductService {

    private final SellerRepository sellerRepository;

    private final ProductRepository productRepository;

    private final CategoryRepository categoryRepository;

    private final SubCategoryRepository subCategoryRepository;

    private final BrandRepository brandRepository;

    private final ProductInformationRepository productInformationRepository;

    private final ProductSpecificationRepository productSpecificationRepository;

    private final ProductVariantRepository productVariantRepository;

    private final VariantAttributeRepository variantAttributeRepository;

    private final ProductVariantPriceRepository productVariantPriceRepository;

    private final ProductImageRepository productImageRepository;

    private final WarehouseRepository warehouseRepository;

    private final InventoryRepository inventoryRepository;

    private final InventoryItemRepository inventoryItemRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String supabaseServiceRoleKey;

    @Value("${supabase.product-bucket:product-images}")
    private String productBucket;


    // =========================================================
    // CREATE COMPLETE PRODUCT
    // =========================================================

    @Override
    public SellerProductResponse createProduct(
            Long userId,
            SellerProductCreateRequest request,
            MultipartFile[] images
    ) {

        validateUserId(userId);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Product data is required"
            );
        }

        Seller seller = getSellerByUserId(userId);


        // -----------------------------------------------------
        // CATEGORY
        // -----------------------------------------------------

        Category category = categoryRepository
                .findByIdAndStatus(
                        request.getCategoryId(),
                        CategoryStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Active category not found"
                        )
                );


        // -----------------------------------------------------
        // SUB CATEGORY
        // -----------------------------------------------------

        SubCategory subCategory = subCategoryRepository
                .findByIdAndStatus(
                        request.getSubCategoryId(),
                        SubCategoryStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Active subcategory not found"
                        )
                );


        // -----------------------------------------------------
        // VERIFY SUBCATEGORY BELONGS TO CATEGORY
        // -----------------------------------------------------

        if (subCategory.getCategory() == null ||
                !subCategory.getCategory()
                        .getId()
                        .equals(category.getId())) {

            throw new IllegalArgumentException(
                    "Subcategory does not belong to selected category"
            );
        }


        // -----------------------------------------------------
        // BRAND
        // -----------------------------------------------------

        Brand brand = brandRepository
                .findByIdAndStatus(
                        request.getBrandId(),
                        BrandStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Active brand not found"
                        )
                );


        // -----------------------------------------------------
        // SLUG
        // -----------------------------------------------------

        String slug = normalizeRequired(
                request.getSlug(),
                "Product slug"
        );

        if (productRepository.existsBySlugIgnoreCase(slug)) {

            throw new IllegalArgumentException(
                    "Product slug already exists: " + slug
            );
        }


        // -----------------------------------------------------
        // VALIDATE PRODUCT DATA
        // -----------------------------------------------------

        String productName = normalizeRequired(
                request.getName(),
                "Product name"
        );

        validateSpecifications(
                request.getSpecifications()
        );

        validateVariants(
                request.getVariants()
        );


        // -----------------------------------------------------
        // CREATE PRODUCT
        // -----------------------------------------------------

        ProductEntity product = ProductEntity.builder()
                .seller(seller)
                .category(category)
                .subCategory(subCategory)
                .brand(brand)
                .name(productName)
                .slug(slug)
                .description(request.getDescription())
                .status(ProductStatus.ACTIVE)
                .build();

        product = productRepository.save(product);


        // -----------------------------------------------------
        // PRODUCT INFORMATION
        // -----------------------------------------------------

        if (request.getInformation() != null) {

            ProductInformationEntity information =
                    ProductInformationEntity.builder()
                            .productEntity(product)
                            .shortDescription(
                                    request.getInformation()
                                            .getShortDescription()
                            )
                            .longDescription(
                                    request.getInformation()
                                            .getLongDescription()
                            )
                            .warranty(
                                    request.getInformation()
                                            .getWarranty()
                            )
                            .manufacturer(
                                    request.getInformation()
                                            .getManufacturer()
                            )
                            .build();

            productInformationRepository.save(
                    information
            );
        }


        // -----------------------------------------------------
        // PRODUCT SPECIFICATIONS
        // -----------------------------------------------------

        if (request.getSpecifications() != null &&
                !request.getSpecifications().isEmpty()) {

            for (SellerProductSpecificationRequest specificationRequest
                    : request.getSpecifications()) {

                ProductSpecification specification =
                        ProductSpecification.builder()
                                .productEntity(product)
                                .specificationName(
                                        normalizeRequired(
                                                specificationRequest
                                                        .getSpecificationName(),
                                                "Specification name"
                                        )
                                )
                                .specificationValue(
                                        normalizeRequired(
                                                specificationRequest
                                                        .getSpecificationValue(),
                                                "Specification value"
                                        )
                                )
                                .build();

                productSpecificationRepository.save(
                        specification
                );
            }
        }


        // -----------------------------------------------------
        // PRODUCT VARIANTS
        // -----------------------------------------------------

        if (request.getVariants() != null &&
                !request.getVariants().isEmpty()) {

            for (SellerProductVariantRequest variantRequest
                    : request.getVariants()) {

                createVariant(
                        product,
                        seller,
                        variantRequest
                );
            }
        }


        // -----------------------------------------------------
        // PRODUCT IMAGES
        // -----------------------------------------------------

        if (images != null &&
                images.length > 0) {

            uploadProductImages(
                    product,
                    seller,
                    images
            );
        }


        // -----------------------------------------------------
        // RETURN COMPLETE RESPONSE
        // -----------------------------------------------------

        return mapToResponse(product);
    }


    // =========================================================
    // CREATE VARIANT
    // =========================================================

    private ProductVariantEntity createVariant(
            ProductEntity product,
            Seller seller,
            SellerProductVariantRequest request
    ) {

        String sku = normalizeRequired(
                request.getSku(),
                "SKU"
        );


        // -----------------------------------------------------
        // SKU DUPLICATE CHECK
        // -----------------------------------------------------

        if (productVariantRepository
                .existsBySkuIgnoreCase(sku)) {

            throw new IllegalArgumentException(
                    "SKU already exists: " + sku
            );
        }


        // -----------------------------------------------------
        // ATTRIBUTES
        // -----------------------------------------------------

        validateVariantAttributes(
                request.getAttributes()
        );


        // -----------------------------------------------------
        // PRICE
        // -----------------------------------------------------

        if (request.getPrice() != null) {

            validatePrice(
                    request.getPrice()
            );
        }


        // -----------------------------------------------------
        // INVENTORY
        // -----------------------------------------------------

        validateInventories(
                seller,
                request.getInventories()
        );


        // -----------------------------------------------------
        // CREATE VARIANT
        // -----------------------------------------------------

        ProductVariantEntity variant =
                ProductVariantEntity.builder()
                        .productEntity(product)
                        .sku(sku)
                        .status(ProductVariantStatus.ACTIVE)
                        .build();

        variant =
                productVariantRepository.save(
                        variant
                );


        // -----------------------------------------------------
        // SAVE ATTRIBUTES
        // -----------------------------------------------------

        for (SellerProductVariantAttributeRequest attributeRequest
                : request.getAttributes()) {

            VariantAttributeEntity attribute =
                    VariantAttributeEntity.builder()
                            .variant(variant)
                            .attributeName(
                                    normalizeRequired(
                                            attributeRequest
                                                    .getAttributeName(),
                                            "Attribute name"
                                    )
                            )
                            .attributeValue(
                                    normalizeRequired(
                                            attributeRequest
                                                    .getAttributeValue(),
                                            "Attribute value"
                                    )
                            )
                            .build();

            variantAttributeRepository.save(
                    attribute
            );
        }


        // -----------------------------------------------------
        // SAVE PRICE
        // -----------------------------------------------------

        if (request.getPrice() != null) {

            SellerProductVariantPriceRequest priceRequest =
                    request.getPrice();

            BigDecimal discount =
                    calculateDiscountPercentage(
                            priceRequest.getMrp(),
                            priceRequest.getSellingPrice()
                    );

            ProductVariantPriceEntity price =
                    ProductVariantPriceEntity.builder()
                            .productVariant(variant)
                            .mrp(priceRequest.getMrp())
                            .sellingPrice(
                                    priceRequest.getSellingPrice()
                            )
                            .discountPercentage(discount)
                            .currency(
                                    priceRequest
                                            .getCurrency()
                                            .trim()
                                            .toUpperCase(Locale.ROOT)
                            )
                            .effectiveFrom(
                                    java.time.LocalDateTime.now()
                            )
                            .build();

            productVariantPriceRepository.save(
                    price
            );
        }


        // -----------------------------------------------------
        // SAVE INVENTORY
        // -----------------------------------------------------

        if (request.getInventories() != null &&
                !request.getInventories().isEmpty()) {

            for (SellerProductInventoryRequest inventoryRequest
                    : request.getInventories()) {

                createInventoryItem(
                        seller,
                        variant,
                        inventoryRequest
                );
            }
        }

        return variant;
    }


    // =========================================================
    // CREATE INVENTORY ITEM
    // =========================================================

    private InventoryItem createInventoryItem(
            Seller seller,
            ProductVariantEntity variant,
            SellerProductInventoryRequest request
    ) {

        Warehouse warehouse =
                warehouseRepository
                        .findByIdAndSeller(
                                request.getWarehouseId(),
                                seller
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Warehouse not found or does not belong to seller: "
                                                + request.getWarehouseId()
                                )
                        );


        // -----------------------------------------------------
        // ACTIVE WAREHOUSE
        // -----------------------------------------------------

        if (warehouse.getStatus() != WarehouseStatus.ACTIVE) {

            throw new IllegalArgumentException(
                    "Warehouse is not active: "
                            + warehouse.getId()
            );
        }


        // -----------------------------------------------------
        // QUANTITY
        // -----------------------------------------------------

        int quantity =
                request.getQuantity() == null
                        ? 0
                        : request.getQuantity();

        int reserved =
                request.getReservedQuantity() == null
                        ? 0
                        : request.getReservedQuantity();


        if (reserved > quantity) {

            throw new IllegalArgumentException(
                    "Reserved quantity cannot be greater than quantity"
            );
        }


        int available =
                quantity - reserved;


        // -----------------------------------------------------
        // GET / CREATE WAREHOUSE INVENTORY
        // -----------------------------------------------------

        Inventory inventory =
                inventoryRepository
                        .findByWarehouse(warehouse)
                        .orElseGet(() ->
                                inventoryRepository.save(
                                        Inventory.builder()
                                                .warehouse(warehouse)
                                                .build()
                                )
                        );


        // -----------------------------------------------------
        // DUPLICATE VARIANT IN WAREHOUSE
        // -----------------------------------------------------

        if (inventoryItemRepository
                .existsByInventoryIdAndProductVariantId(
                        inventory.getId(),
                        variant.getId()
                )) {

            throw new IllegalArgumentException(
                    "Product variant already exists in warehouse: "
                            + warehouse.getId()
            );
        }


        // -----------------------------------------------------
        // CREATE ITEM
        // -----------------------------------------------------

        InventoryItem item =
                InventoryItem.builder()
                        .inventory(inventory)
                        .productVariant(variant)
                        .availableStock(available)
                        .reservedStock(reserved)
                        .build();

        return inventoryItemRepository.save(
                item
        );
    }


    // =========================================================
    // IMAGE UPLOAD
    // =========================================================

    private void uploadProductImages(
            ProductEntity product,
            Seller seller,
            MultipartFile[] images
    ) {

        boolean primaryAssigned = false;

        for (int i = 0; i < images.length; i++) {

            MultipartFile image = images[i];

            validateImage(image);


            String objectPath =
                    seller.getId()
                            + "/products/"
                            + product.getId()
                            + "/"
                            + UUID.randomUUID()
                            + getExtension(image);


            String imageUrl =
                    uploadToSupabase(
                            image,
                            objectPath
                    );


            boolean isPrimary =
                    !primaryAssigned;

            if (isPrimary) {
                primaryAssigned = true;
            }


            ProductImageEntity imageEntity =
                    ProductImageEntity.builder()
                            .productEntity(product)
                            .imageUrl(imageUrl)
                            .isPrimary(isPrimary)
                            .displayOrder(i)
                            .build();

            productImageRepository.save(
                    imageEntity
            );
        }
    }


    // =========================================================
    // SUPABASE IMAGE UPLOAD
    // =========================================================

    private String uploadToSupabase(
            MultipartFile file,
            String objectPath
    ) {

        try {

            String uploadUrl =
                    supabaseUrl
                            + "/storage/v1/object/"
                            + productBucket
                            + "/"
                            + objectPath;


            HttpHeaders headers =
                    new HttpHeaders();

            headers.set(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + supabaseServiceRoleKey
            );

            headers.set(
                    "apikey",
                    supabaseServiceRoleKey
            );

            headers.setContentType(
                    MediaType.parseMediaType(
                            Objects.requireNonNull(
                                    file.getContentType()
                            )
                    )
            );


            HttpEntity<byte[]> httpEntity =
                    new HttpEntity<>(
                            file.getBytes(),
                            headers
                    );


            ResponseEntity<String> response =
                    restTemplate.exchange(
                            uploadUrl,
                            HttpMethod.POST,
                            httpEntity,
                            String.class
                    );


            if (!response.getStatusCode()
                    .is2xxSuccessful()) {

                throw new IllegalStateException(
                        "Failed to upload product image to Supabase"
                );
            }


            // -------------------------------------------------
            // PUBLIC PRODUCT IMAGE URL
            // -------------------------------------------------

            return supabaseUrl
                    + "/storage/v1/object/public/"
                    + productBucket
                    + "/"
                    + objectPath;

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Failed to read product image",
                    e
            );

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to upload product image",
                    e
            );
        }
    }


    // =========================================================
    // IMAGE VALIDATION
    // =========================================================

    private void validateImage(
            MultipartFile image
    ) {

        if (image == null ||
                image.isEmpty()) {

            throw new IllegalArgumentException(
                    "Product image cannot be empty"
            );
        }


        String contentType =
                image.getContentType();

        if (contentType == null ||
                !contentType
                        .toLowerCase(Locale.ROOT)
                        .startsWith("image/")) {

            throw new IllegalArgumentException(
                    "Only image files are allowed"
            );
        }


        // 5 MB maximum per image
        long maxSize =
                5L * 1024L * 1024L;

        if (image.getSize() > maxSize) {

            throw new IllegalArgumentException(
                    "Product image size must not exceed 5 MB"
            );
        }
    }


    // =========================================================
    // VALIDATE PRICE
    // =========================================================

    private void validatePrice(
            SellerProductVariantPriceRequest price
    ) {

        if (price.getMrp() == null ||
                price.getSellingPrice() == null) {

            throw new IllegalArgumentException(
                    "MRP and selling price are required"
            );
        }


        if (price.getMrp().compareTo(
                price.getSellingPrice()
        ) < 0) {

            throw new IllegalArgumentException(
                    "Selling price cannot be greater than MRP"
            );
        }


        if (price.getMrp().compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new IllegalArgumentException(
                    "MRP must be greater than zero"
            );
        }


        if (price.getSellingPrice().compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new IllegalArgumentException(
                    "Selling price must be greater than zero"
            );
        }
    }


    // =========================================================
    // DISCOUNT CALCULATION
    // =========================================================

    private BigDecimal calculateDiscountPercentage(
            BigDecimal mrp,
            BigDecimal sellingPrice
    ) {

        if (mrp == null ||
                sellingPrice == null ||
                mrp.compareTo(BigDecimal.ZERO) <= 0) {

            return BigDecimal.ZERO;
        }


        return mrp
                .subtract(sellingPrice)
                .divide(
                        mrp,
                        4,
                        RoundingMode.HALF_UP
                )
                .multiply(
                        BigDecimal.valueOf(100)
                )
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }


    // =========================================================
    // VALIDATE SPECIFICATIONS
    // =========================================================

    private void validateSpecifications(
            List<SellerProductSpecificationRequest> specifications
    ) {

        if (specifications == null ||
                specifications.isEmpty()) {

            return;
        }


        Set<String> names =
                new HashSet<>();

        for (SellerProductSpecificationRequest specification
                : specifications) {

            String name =
                    normalizeRequired(
                            specification.getSpecificationName(),
                            "Specification name"
                    );

            String normalizedName =
                    name.toLowerCase(Locale.ROOT);

            if (!names.add(normalizedName)) {

                throw new IllegalArgumentException(
                        "Duplicate specification name: "
                                + name
                );
            }
        }
    }


    // =========================================================
    // VALIDATE VARIANTS
    // =========================================================

    private void validateVariants(
            List<SellerProductVariantRequest> variants
    ) {

        if (variants == null ||
                variants.isEmpty()) {

            return;
        }


        Set<String> skus =
                new HashSet<>();

        for (SellerProductVariantRequest variant
                : variants) {

            String sku =
                    normalizeRequired(
                            variant.getSku(),
                            "SKU"
                    );

            String normalizedSku =
                    sku.toLowerCase(Locale.ROOT);

            if (!skus.add(normalizedSku)) {

                throw new IllegalArgumentException(
                        "Duplicate SKU in request: "
                                + sku
                );
            }
        }
    }


    // =========================================================
    // VALIDATE VARIANT ATTRIBUTES
    // =========================================================

    private void validateVariantAttributes(
            List<SellerProductVariantAttributeRequest> attributes
    ) {

        if (attributes == null ||
                attributes.isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one variant attribute is required"
            );
        }


        Set<String> names =
                new HashSet<>();

        for (SellerProductVariantAttributeRequest attribute
                : attributes) {

            String name =
                    normalizeRequired(
                            attribute.getAttributeName(),
                            "Attribute name"
                    );

            normalizeRequired(
                    attribute.getAttributeValue(),
                    "Attribute value"
            );


            String normalizedName =
                    name.toLowerCase(Locale.ROOT);

            if (!names.add(normalizedName)) {

                throw new IllegalArgumentException(
                        "Duplicate variant attribute: "
                                + name
                );
            }
        }
    }


    // =========================================================
    // VALIDATE INVENTORIES
    // =========================================================

    private void validateInventories(
            Seller seller,
            List<SellerProductInventoryRequest> inventories
    ) {

        if (inventories == null ||
                inventories.isEmpty()) {

            return;
        }


        Set<Long> warehouseIds =
                new HashSet<>();


        for (SellerProductInventoryRequest inventory
                : inventories) {

            if (inventory.getWarehouseId() == null ||
                    inventory.getWarehouseId() <= 0) {

                throw new IllegalArgumentException(
                        "Warehouse ID must be greater than zero"
                );
            }


            if (!warehouseIds.add(
                    inventory.getWarehouseId()
            )) {

                throw new IllegalArgumentException(
                        "Duplicate warehouse in variant inventory: "
                                + inventory.getWarehouseId()
                );
            }


            Warehouse warehouse =
                    warehouseRepository
                            .findByIdAndSeller(
                                    inventory.getWarehouseId(),
                                    seller
                            )
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Warehouse not found or does not belong to seller: "
                                                    + inventory.getWarehouseId()
                                    )
                            );


            if (warehouse.getStatus()
                    != WarehouseStatus.ACTIVE) {

                throw new IllegalArgumentException(
                        "Warehouse is not active: "
                                + warehouse.getId()
                );
            }


            int quantity =
                    inventory.getQuantity() == null
                            ? 0
                            : inventory.getQuantity();

            int reserved =
                    inventory.getReservedQuantity() == null
                            ? 0
                            : inventory.getReservedQuantity();


            if (reserved > quantity) {

                throw new IllegalArgumentException(
                        "Reserved quantity cannot be greater than quantity"
                );
            }
        }
    }


    // =========================================================
    // MAP PRODUCT RESPONSE
    // =========================================================

    @Transactional(readOnly = true)
    protected SellerProductResponse mapToResponse(
            ProductEntity product
    ) {

        ProductInformationEntity information =
                productInformationRepository
                        .findByProductEntity_Id(
                                product.getId()
                        )
                        .orElse(null);


        List<ProductSpecification> specifications =
                productSpecificationRepository
                        .findByProductEntity_IdOrderBySpecificationNameAsc(
                                product.getId()
                        );


        List<ProductVariantEntity> variants =
                productVariantRepository
                        .findByProductEntity_Id(
                                product.getId()
                        );


        List<ProductImageEntity> images =
                productImageRepository
                        .findByProductEntity_IdOrderByDisplayOrderAsc(
                                product.getId()
                        );


        return SellerProductResponse.builder()
                .id(product.getId())
                .categoryId(
                        product.getCategory()
                                .getId()
                )
                .subCategoryId(
                        product.getSubCategory()
                                .getId()
                )
                .brandId(
                        product.getBrand()
                                .getId()
                )
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .status(
                        product.getStatus()
                                .name()
                )
                .information(
                        mapInformation(information)
                )
                .specifications(
                        specifications.stream()
                                .map(this::mapSpecification)
                                .toList()
                )
                .variants(
                        variants.stream()
                                .map(this::mapVariant)
                                .toList()
                )
                .images(
                        images.stream()
                                .map(this::mapImage)
                                .toList()
                )
                .build();
    }


    // =========================================================
    // MAP INFORMATION
    // =========================================================

    private SellerProductInformationResponse mapInformation(
            ProductInformationEntity information
    ) {

        if (information == null) {
            return null;
        }


        return SellerProductInformationResponse.builder()
                .shortDescription(
                        information.getShortDescription()
                )
                .longDescription(
                        information.getLongDescription()
                )
                .warranty(
                        information.getWarranty()
                )
                .manufacturer(
                        information.getManufacturer()
                )
                .build();
    }


    // =========================================================
    // MAP SPECIFICATION
    // =========================================================

    private SellerProductSpecificationResponse mapSpecification(
            ProductSpecification specification
    ) {

        return SellerProductSpecificationResponse.builder()
                .id(specification.getId())
                .specificationName(
                        specification.getSpecificationName()
                )
                .specificationValue(
                        specification.getSpecificationValue()
                )
                .build();
    }


    // =========================================================
    // MAP VARIANT
    // =========================================================

    private SellerProductVariantResponse mapVariant(
            ProductVariantEntity variant
    ) {

        List<VariantAttributeEntity> attributes =
                variantAttributeRepository
                        .findByVariantIdOrderByAttributeNameAsc(
                                variant.getId()
                        );


        ProductVariantPriceEntity price =
                productVariantPriceRepository
                        .findByProductVariantId(
                                variant.getId()
                        )
                        .orElse(null);


        List<InventoryItem> inventoryItems =
                inventoryItemRepository
                        .findByProductVariantId(
                                variant.getId()
                        );


        return SellerProductVariantResponse.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .status(
                        variant.getStatus()
                                .name()
                )
                .attributes(
                        attributes.stream()
                                .map(this::mapAttribute)
                                .toList()
                )
                .price(
                        mapPrice(price)
                )
                .inventories(
                        inventoryItems.stream()
                                .map(this::mapInventory)
                                .toList()
                )
                .build();
    }


    // =========================================================
    // MAP ATTRIBUTE
    // =========================================================

    private SellerProductVariantAttributeResponse mapAttribute(
            VariantAttributeEntity attribute
    ) {

        return SellerProductVariantAttributeResponse.builder()
                .id(attribute.getId())
                .attributeName(
                        attribute.getAttributeName()
                )
                .attributeValue(
                        attribute.getAttributeValue()
                )
                .build();
    }


    // =========================================================
    // MAP PRICE
    // =========================================================

    private SellerProductVariantPriceResponse mapPrice(
            ProductVariantPriceEntity price
    ) {

        if (price == null) {
            return null;
        }


        return SellerProductVariantPriceResponse.builder()
                .id(price.getId())
                .mrp(price.getMrp())
                .sellingPrice(
                        price.getSellingPrice()
                )
                .discountPercentage(
                        price.getDiscountPercentage()
                )
                .currency(price.getCurrency())
                .build();
    }


    // =========================================================
    // MAP INVENTORY
    // =========================================================

    private SellerProductInventoryResponse mapInventory(
            InventoryItem item
    ) {

        int available =
                safeStock(
                        item.getAvailableStock()
                );

        int reserved =
                safeStock(
                        item.getReservedStock()
                );

        int quantity =
                available + reserved;


        return SellerProductInventoryResponse.builder()
                .id(item.getId())
                .warehouseId(
                        item.getInventory()
                                .getWarehouse()
                                .getId()
                )
                .quantity(quantity)
                .reservedQuantity(reserved)
                .availableQuantity(available)
                .stockStatus(
                        available > 0
                                ? "IN_STOCK"
                                : "OUT_OF_STOCK"
                )
                .build();
    }


    // =========================================================
    // MAP IMAGE
    // =========================================================

    private SellerProductImageResponse mapImage(
            ProductImageEntity image
    ) {

        return SellerProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .build();
    }


    // =========================================================
    // GET SELLER
    // =========================================================

    private Seller getSellerByUserId(
            Long userId
    ) {

        return sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Seller profile not found"
                        )
                );
    }


    // =========================================================
    // VALIDATE USER ID
    // =========================================================

    private void validateUserId(
            Long userId
    ) {

        if (userId == null ||
                userId <= 0) {

            throw new IllegalArgumentException(
                    "User ID must be greater than zero"
            );
        }
    }


    // =========================================================
    // NORMALIZE REQUIRED STRING
    // =========================================================

    private String normalizeRequired(
            String value,
            String fieldName
    ) {

        if (value == null ||
                value.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    fieldName + " is required"
            );
        }

        return value.trim();
    }


    // =========================================================
    // SAFE STOCK
    // =========================================================

    private int safeStock(
            Integer stock
    ) {

        return stock == null
                ? 0
                : stock;
    }


    // =========================================================
    // FILE EXTENSION
    // =========================================================

    private String getExtension(
            MultipartFile file
    ) {

        String filename =
                file.getOriginalFilename();

        if (filename == null ||
                !filename.contains(".")) {

            return ".bin";
        }


        return filename.substring(
                filename.lastIndexOf(".")
        ).toLowerCase(Locale.ROOT);
    }
}