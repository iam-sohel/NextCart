package com.nextcart.nextcart.product_module.productPrice;

import com.nextcart.nextcart.product_module.exceptions.InvalidPriceException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantNotFoundException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantPriceAlreadyExistsException;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantPriceNotFoundException;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceCreateRequest;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceResponse;
import com.nextcart.nextcart.product_module.productPrice.dto.ProductVariantPriceUpdateRequest;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

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
    // GET PRICE BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductVariantPriceResponse getPriceById(
            Long id) {

        ProductVariantPriceEntity price =
                priceRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductVariantPriceNotFoundException(
                                        "Price not found with id: "
                                                + id
                                )
                        );

        return priceMapper.toResponse(price);
    }

    // =========================================================
    // GET PRICE BY VARIANT ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ProductVariantPriceResponse getPriceByVariantId(
            Long productVariantId) {

        if (!productVariantRepository.existsById(
                productVariantId)) {

            throw new ProductVariantNotFoundException(
                    "Product variant not found with id: "
                            + productVariantId
            );
        }

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
                                        "Price not found with id: "
                                                + id
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
                                        "Price not found with id: "
                                                + id
                                )
                        );

        priceRepository.delete(price);
    }

    // =========================================================
    // VALIDATE PRICE
    // =========================================================

    private void validatePrice(
            BigDecimal mrp,
            BigDecimal sellingPrice) {

        if (mrp == null || sellingPrice == null) {

            throw new InvalidPriceException(
                    "MRP and selling price are required"
            );
        }

        if (mrp.compareTo(BigDecimal.ZERO) <= 0) {

            throw new InvalidPriceException(
                    "MRP must be greater than zero"
            );
        }

        if (sellingPrice.compareTo(BigDecimal.ZERO) <= 0) {

            throw new InvalidPriceException(
                    "Selling price must be greater than zero"
            );
        }

        if (sellingPrice.compareTo(mrp) > 0) {

            throw new InvalidPriceException(
                    "Selling price cannot be greater than MRP"
            );
        }
    }
}