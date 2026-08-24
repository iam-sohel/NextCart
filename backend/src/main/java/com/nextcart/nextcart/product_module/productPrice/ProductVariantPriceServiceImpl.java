package com.nextcart.nextcart.product_module.productPrice;

import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceCreateRequest;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceResponse;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceUpdateRequest;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.exceptions.InvalidPriceException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantPriceAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantPriceNotFoundException;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantPriceServiceImpl
        implements ProductVariantPriceService {

    private final ProductVariantPriceRepository priceRepository;

    private final ProductVariantRepository productVariantRepository;

    private final ProductVariantPriceMapper priceMapper;

    // =========================================================
    // CREATE PRICE
    // =========================================================

    @Override
    public ProductVariantPriceResponse createPrice(
            Long productVariantId,
            ProductVariantPriceCreateRequest request) {

        ProductVariantEntity variant =
                productVariantRepository.findById(productVariantId)
                        .orElseThrow(() ->
                                new ProductVariantNotFoundException(
                                        "Product variant not found with id: "
                                                + productVariantId
                                )
                        );

        if (priceRepository.existsByProductVariantId(
                productVariantId)) {

            throw new ProductVariantPriceAlreadyExistsException(
                    "Price already exists for product variant id: "
                            + productVariantId
            );
        }

        validatePrice(
                request.getMrp(),
                request.getSellingPrice()
        );

        ProductVariantPriceEntity price =
                priceMapper.toEntity(request);

        price.setProductVariant(variant);

        ProductVariantPriceEntity savedPrice =
                priceRepository.save(price);

        return priceMapper.toResponse(savedPrice);
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductVariantPriceResponse getPriceById(
            Long id) {

        ProductVariantPriceEntity price =
                priceRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantPriceNotFoundException(
                                        "Price not found with id: " + id
                                )
                        );

        return priceMapper.toResponse(price);
    }

    // =========================================================
    // GET BY VARIANT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductVariantPriceResponse getPriceByVariantId(
            Long productVariantId) {

        ProductVariantPriceEntity price =
                priceRepository
                        .findByProductVariantId(productVariantId)
                        .orElseThrow(() ->
                                new ProductVariantPriceNotFoundException(
                                        "Price not found for product variant id: "
                                                + productVariantId
                                )
                        );

        return priceMapper.toResponse(price);
    }

    // =========================================================
    // UPDATE PRICE
    // =========================================================

    @Override
    public ProductVariantPriceResponse updatePrice(
            Long id,
            ProductVariantPriceUpdateRequest request) {

        ProductVariantPriceEntity price =
                priceRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantPriceNotFoundException(
                                        "Price not found with id: " + id
                                )
                        );

        validatePrice(
                request.getMrp(),
                request.getSellingPrice()
        );

        priceMapper.updateEntity(
                request,
                price
        );

        ProductVariantPriceEntity updatedPrice =
                priceRepository.save(price);

        return priceMapper.toResponse(updatedPrice);
    }

    // =========================================================
    // DELETE PRICE
    // =========================================================

    @Override
    public void deletePrice(Long id) {

        ProductVariantPriceEntity price =
                priceRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantPriceNotFoundException(
                                        "Price not found with id: " + id
                                )
                        );

        priceRepository.delete(price);
    }

    // =========================================================
    // PRICE VALIDATION
    // =========================================================

    private void validatePrice(
            java.math.BigDecimal mrp,
            java.math.BigDecimal sellingPrice) {

        if (sellingPrice.compareTo(mrp) > 0) {

            throw new InvalidPriceException(
                    "Selling price cannot be greater than MRP"
            );
        }
    }
}