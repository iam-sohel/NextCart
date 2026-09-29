package com.gesmio.havlook.seller_module.product.service;

import com.gesmio.havlook.brand_module.entity.Brand;
import com.gesmio.havlook.brand_module.entity.BrandStatus;
import com.gesmio.havlook.brand_module.repository.BrandRepository;
import com.gesmio.havlook.category_module.entity.Category;
import com.gesmio.havlook.category_module.entity.CategoryStatus;
import com.gesmio.havlook.category_module.repository.CategoryRepository;
import com.gesmio.havlook.product_module.productImage.entity.ProductImageEntity;
import com.gesmio.havlook.product_module.productImage.repository.ProductImageRepository;
import com.gesmio.havlook.product_module.productInformation.entity.ProductInformationEntity;
import com.gesmio.havlook.product_module.productInformation.repository.ProductInformationRepository;
import com.gesmio.havlook.product_module.productPrice.entity.ProductVariantPriceEntity;
import com.gesmio.havlook.product_module.productPrice.repository.ProductVariantPriceRepository;
import com.gesmio.havlook.product_module.productSpecification.entity.ProductSpecification;
import com.gesmio.havlook.product_module.productSpecification.repository.ProductSpecificationRepository;
import com.gesmio.havlook.product_module.productVariant.entity.ProductVariantEntity;
import com.gesmio.havlook.product_module.productVariant.entity.ProductVariantStatus;
import com.gesmio.havlook.product_module.productVariant.repository.ProductVariantRepository;
import com.gesmio.havlook.product_module.product_base.entity.ProductEntity;
import com.gesmio.havlook.product_module.product_base.entity.ProductStatus;
import com.gesmio.havlook.product_module.product_base.repository.ProductRepository;
import com.gesmio.havlook.product_module.variantAttribute.entity.VariantAttributeEntity;
import com.gesmio.havlook.product_module.variantAttribute.repository.VariantAttributeRepository;
import com.gesmio.havlook.seller_module.inventory_module.entity.Inventory;
import com.gesmio.havlook.seller_module.inventory_module.entity.InventoryItem;
import com.gesmio.havlook.seller_module.inventory_module.repository.InventoryItemRepository;
import com.gesmio.havlook.seller_module.inventory_module.repository.InventoryRepository;
import com.gesmio.havlook.seller_module.product.dto.*;
import com.gesmio.havlook.seller_module.product.dto.*;
import com.gesmio.havlook.seller_module.product.exceptions.SellerNotFoundException;
import com.gesmio.havlook.seller_module.product.exceptions.SellerProductAlreadyExistsException;
import com.gesmio.havlook.seller_module.product.exceptions.SellerProductImageException;
import com.gesmio.havlook.seller_module.product.exceptions.SellerProductInventoryException;
import com.gesmio.havlook.seller_module.product.exceptions.SellerProductPriceException;
import com.gesmio.havlook.seller_module.product.exceptions.SellerProductValidationException;
import com.gesmio.havlook.seller_module.product.exceptions.SellerProductVariantAlreadyExistsException;
import com.gesmio.havlook.seller_module.product.exceptions.SellerProductWarehouseException;
import com.gesmio.havlook.seller_module.seller.entity.Seller;
import com.gesmio.havlook.seller_module.seller.repository.SellerRepository;
import com.gesmio.havlook.seller_module.warehouse_module.entity.Warehouse;
import com.gesmio.havlook.seller_module.warehouse_module.entity.WarehouseStatus;
import com.gesmio.havlook.seller_module.warehouse_module.repository.WarehouseRepository;
import com.gesmio.havlook.subcategory_module.entity.SubCategory;
import com.gesmio.havlook.subcategory_module.entity.SubCategoryStatus;
import com.gesmio.havlook.subcategory_module.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

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
            throw new SellerProductValidationException(
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
                        new SellerProductValidationException(
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
                        new SellerProductValidationException(
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

            throw new SellerProductValidationException(
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
                        new SellerProductValidationException(
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
            throw new SellerProductAlreadyExistsException(
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

            productInformationRepository.save(information);
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

        if (request == null) {
            throw new SellerProductValidationException(
                    "Product variant data is required"
            );
        }

        String sku = normalizeRequired(
                request.getSku(),
                "SKU"
        );

        // -----------------------------------------------------
        // SKU DUPLICATE CHECK
        // -----------------------------------------------------

        if (productVariantRepository
                .existsBySkuIgnoreCase(sku)) {

            throw new SellerProductVariantAlreadyExistsException(
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
            validatePrice(request.getPrice());
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

        variant = productVariantRepository.save(variant);

        // -----------------------------------------------------
        // SAVE ATTRIBUTES
        // -----------------------------------------------------

        for (SellerProductVariantAttributeRequest attributeRequest
                : request.getAttributes()) {

            if (attributeRequest == null) {
                throw new SellerProductValidationException(
                        "Variant attribute data is required"
                );
            }

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

            variantAttributeRepository.save(attribute);
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

            String currency = normalizeRequired(
                    priceRequest.getCurrency(),
                    "Currency"
            ).toUpperCase(Locale.ROOT);

            ProductVariantPriceEntity price =
                    ProductVariantPriceEntity.builder()
                            .productVariant(variant)
                            .mrp(priceRequest.getMrp())
                            .sellingPrice(
                                    priceRequest.getSellingPrice()
                            )
                            .discountPercentage(discount)
                            .currency(currency)
                            .effectiveFrom(
                                    java.time.LocalDateTime.now()
                            )
                            .build();

            productVariantPriceRepository.save(price);
        }

        // -----------------------------------------------------
        // SAVE INVENTORY
        // -----------------------------------------------------

        if (request.getInventories() != null &&
                !request.getInventories().isEmpty()) {

            for (SellerProductInventoryRequest inventoryRequest
                    : request.getInventories()) {

                if (inventoryRequest == null) {
                    throw new SellerProductInventoryException(
                            "Inventory data is required"
                    );
                }

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

        if (request == null) {
            throw new SellerProductInventoryException(
                    "Inventory data is required"
            );
        }

        Warehouse warehouse =
                warehouseRepository
                        .findByIdAndSeller(
                                request.getWarehouseId(),
                                seller
                        )
                        .orElseThrow(() ->
                                new SellerProductWarehouseException(
                                        "Warehouse not found or does not belong to seller: "
                                                + request.getWarehouseId()
                                )
                        );

        // -----------------------------------------------------
        // ACTIVE WAREHOUSE
        // -----------------------------------------------------

        if (warehouse.getStatus() != WarehouseStatus.ACTIVE) {

            throw new SellerProductWarehouseException(
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

        if (quantity < 0 || reserved < 0) {
            throw new SellerProductInventoryException(
                    "Inventory quantity cannot be negative"
            );
        }

        if (reserved > quantity) {
            throw new SellerProductInventoryException(
                    "Reserved quantity cannot be greater than quantity"
            );
        }

        int available = quantity - reserved;

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

            throw new SellerProductInventoryException(
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

        return inventoryItemRepository.save(item);
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

            boolean isPrimary = !primaryAssigned;

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

            productImageRepository.save(imageEntity);
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

            HttpHeaders headers = new HttpHeaders();

            headers.set(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + supabaseServiceRoleKey
            );

            headers.set(
                    "apikey",
                    supabaseServiceRoleKey
            );

            String contentType = file.getContentType();

            if (contentType == null ||
                    contentType.isBlank()) {

                throw new SellerProductImageException(
                        "Product image content type is required"
                );
            }

            headers.setContentType(
                    MediaType.parseMediaType(contentType)
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

                throw new SellerProductImageException(
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

            throw new SellerProductImageException(
                    "Failed to read product image",
                    e
            );

        } catch (SellerProductImageException e) {

            throw e;

        } catch (Exception e) {

            throw new SellerProductImageException(
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

            throw new SellerProductImageException(
                    "Product image cannot be empty"
            );
        }

        String contentType =
                image.getContentType();

        if (contentType == null ||
                !contentType
                        .toLowerCase(Locale.ROOT)
                        .startsWith("image/")) {

            throw new SellerProductImageException(
                    "Only image files are allowed"
            );
        }

        // 5 MB maximum per image
        long maxSize =
                5L * 1024L * 1024L;

        if (image.getSize() > maxSize) {

            throw new SellerProductImageException(
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

        if (price == null) {
            throw new SellerProductPriceException(
                    "Price data is required"
            );
        }

        if (price.getMrp() == null ||
                price.getSellingPrice() == null) {

            throw new SellerProductPriceException(
                    "MRP and selling price are required"
            );
        }

        if (price.getMrp().compareTo(
                price.getSellingPrice()
        ) < 0) {

            throw new SellerProductPriceException(
                    "Selling price cannot be greater than MRP"
            );
        }

        if (price.getMrp().compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new SellerProductPriceException(
                    "MRP must be greater than zero"
            );
        }

        if (price.getSellingPrice().compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new SellerProductPriceException(
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

        Set<String> names = new HashSet<>();

        for (SellerProductSpecificationRequest specification
                : specifications) {

            if (specification == null) {
                throw new SellerProductValidationException(
                        "Specification data is required"
                );
            }

            String name =
                    normalizeRequired(
                            specification.getSpecificationName(),
                            "Specification name"
                    );

            String normalizedName =
                    name.toLowerCase(Locale.ROOT);

            if (!names.add(normalizedName)) {

                throw new SellerProductValidationException(
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

        Set<String> skus = new HashSet<>();

        for (SellerProductVariantRequest variant
                : variants) {

            if (variant == null) {
                throw new SellerProductValidationException(
                        "Product variant data is required"
                );
            }

            String sku =
                    normalizeRequired(
                            variant.getSku(),
                            "SKU"
                    );

            String normalizedSku =
                    sku.toLowerCase(Locale.ROOT);

            if (!skus.add(normalizedSku)) {

                throw new SellerProductVariantAlreadyExistsException(
                        "Duplicate SKU in request: " + sku
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

            throw new SellerProductValidationException(
                    "At least one variant attribute is required"
            );
        }

        Set<String> names = new HashSet<>();

        for (SellerProductVariantAttributeRequest attribute
                : attributes) {

            if (attribute == null) {
                throw new SellerProductValidationException(
                        "Variant attribute data is required"
                );
            }

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

                throw new SellerProductValidationException(
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

        Set<Long> warehouseIds = new HashSet<>();

        for (SellerProductInventoryRequest inventory
                : inventories) {

            if (inventory == null) {
                throw new SellerProductInventoryException(
                        "Inventory data is required"
                );
            }

            if (inventory.getWarehouseId() == null ||
                    inventory.getWarehouseId() <= 0) {

                throw new SellerProductWarehouseException(
                        "Warehouse ID must be greater than zero"
                );
            }

            if (!warehouseIds.add(
                    inventory.getWarehouseId()
            )) {

                throw new SellerProductWarehouseException(
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
                                    new SellerProductWarehouseException(
                                            "Warehouse not found or does not belong to seller: "
                                                    + inventory.getWarehouseId()
                                    )
                            );

            if (warehouse.getStatus()
                    != WarehouseStatus.ACTIVE) {

                throw new SellerProductWarehouseException(
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

            if (quantity < 0 || reserved < 0) {

                throw new SellerProductInventoryException(
                        "Inventory quantity cannot be negative"
                );
            }

            if (reserved > quantity) {

                throw new SellerProductInventoryException(
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
                        new SellerNotFoundException(
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

            throw new SellerProductValidationException(
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

            throw new SellerProductValidationException(
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