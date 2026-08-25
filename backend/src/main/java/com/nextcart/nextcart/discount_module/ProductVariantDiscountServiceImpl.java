package com.nextcart.nextcart.discount_module;

import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountCreateRequest;
import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountResponse;
import com.nextcart.nextcart.discount_module.dto.ProductVariantDiscountUpdateRequest;
import com.nextcart.nextcart.discount_module.discountExceptions.InvalidDiscountException;
import com.nextcart.nextcart.discount_module.discountExceptions.ProductVariantDiscountAlreadyExistsException;
import com.nextcart.nextcart.discount_module.discountExceptions.ProductVariantDiscountNotFoundException;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantDiscountServiceImpl
        implements ProductVariantDiscountService {

    private final ProductVariantDiscountRepository discountRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantPriceRepository priceRepository;
    private final ProductVariantDiscountMapper discountMapper;

    @Override
    public ProductVariantDiscountResponse createDiscount(
            ProductVariantDiscountCreateRequest request) {

        validateDates(
                request.getStartAt(),
                request.getEndAt()
        );

        ProductVariantEntity variant =
                productVariantRepository.findById(
                        request.getProductVariantId()
                ).orElseThrow(() ->
                        new InvalidDiscountException(
                                "Product variant not found with id: "
                                        + request.getProductVariantId()
                        )
                );

        validateDiscountValue(
                request.getProductVariantId(),
                request.getDiscountType(),
                request.getDiscountValue()
        );

        validateNoOverlappingDiscount(
                request.getProductVariantId(),
                request.getStartAt(),
                request.getEndAt(),
                null
        );

        ProductVariantDiscountEntity discount =
                discountMapper.toEntity(request);

        discount.setProductVariant(variant);

        ProductVariantDiscountEntity saved =
                discountRepository.save(discount);

        return discountMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantDiscountResponse getDiscountById(
            Long id) {

        ProductVariantDiscountEntity discount =
                findDiscount(id);

        return discountMapper.toResponse(discount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDiscountResponse> getDiscountsByVariant(
            Long productVariantId) {

        validateVariantExists(productVariantId);

        return discountRepository
                .findByProductVariantIdOrderByStartAtDesc(
                        productVariantId
                )
                .stream()
                .map(discountMapper::toResponse)
                .toList();
    }

    @Override
    public ProductVariantDiscountResponse updateDiscount(
            Long id,
            ProductVariantDiscountUpdateRequest request) {

        ProductVariantDiscountEntity discount =
                findDiscount(id);

        validateDates(
                request.getStartAt(),
                request.getEndAt()
        );

        Long productVariantId =
                discount.getProductVariant().getId();

        validateDiscountValue(
                productVariantId,
                request.getDiscountType(),
                request.getDiscountValue()
        );

        validateNoOverlappingDiscount(
                productVariantId,
                request.getStartAt(),
                request.getEndAt(),
                id
        );

        discountMapper.updateEntity(
                request,
                discount
        );

        ProductVariantDiscountEntity updated =
                discountRepository.save(discount);

        return discountMapper.toResponse(updated);
    }

    @Override
    public void deactivateDiscount(Long id) {

        ProductVariantDiscountEntity discount =
                findDiscount(id);

        if (!discount.isActive()) {
            return;
        }

        discount.setActive(false);

        discountRepository.save(discount);
    }

    @Override
    public ProductVariantDiscountResponse restoreDiscount(
            Long id) {

        ProductVariantDiscountEntity discount =
                findDiscount(id);

        if (discount.isActive()) {
            return discountMapper.toResponse(discount);
        }

        LocalDateTime now = LocalDateTime.now();

        if (discount.getEndAt() != null
                && discount.getEndAt().isBefore(now)) {

            throw new InvalidDiscountException(
                    "Cannot restore an expired discount"
            );
        }

        validateNoOverlappingDiscount(
                discount.getProductVariant().getId(),
                discount.getStartAt(),
                discount.getEndAt(),
                id
        );

        discount.setActive(true);

        ProductVariantDiscountEntity restored =
                discountRepository.save(discount);

        return discountMapper.toResponse(restored);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantDiscountResponse getCurrentDiscount(
            Long productVariantId) {

        validateVariantExists(productVariantId);

        ProductVariantDiscountEntity discount =
                discountRepository
                        .findCurrentDiscount(
                                productVariantId,
                                LocalDateTime.now()
                        )
                        .orElseThrow(() ->
                                new ProductVariantDiscountNotFoundException(
                                        "No active discount found for product variant id: "
                                                + productVariantId
                                )
                        );

        return discountMapper.toResponse(discount);
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateDiscountValue(
            Long productVariantId,
            DiscountType discountType,
            BigDecimal discountValue) {

        if (discountType == null) {
            throw new InvalidDiscountException(
                    "Discount type is required"
            );
        }

        if (discountValue == null
                || discountValue.compareTo(BigDecimal.ZERO) <= 0) {

            throw new InvalidDiscountException(
                    "Discount value must be greater than zero"
            );
        }

        /*
         * Percentage discount
         */
        if (discountType == DiscountType.PERCENTAGE) {

            if (discountValue.compareTo(
                    BigDecimal.valueOf(100)) > 0) {

                throw new InvalidDiscountException(
                        "Percentage discount cannot exceed 100%"
                );
            }

            return;
        }

        /*
         * Fixed amount discount
         */
        if (discountType == DiscountType.FIXED_AMOUNT) {

            ProductVariantPriceEntity price =
                    priceRepository
                            .findByProductVariantId(productVariantId)
                            .orElseThrow(() ->
                                    new InvalidDiscountException(
                                            "Price not found for product variant id: "
                                                    + productVariantId
                                    )
                            );

            BigDecimal sellingPrice =
                    price.getSellingPrice();

            if (sellingPrice == null
                    || sellingPrice.compareTo(BigDecimal.ZERO) <= 0) {

                throw new InvalidDiscountException(
                        "Selling price must be greater than zero"
                );
            }

            if (discountValue.compareTo(sellingPrice) > 0) {

                throw new InvalidDiscountException(
                        "Fixed discount cannot be greater than selling price"
                );
            }
        }
    }

    private void validateDates(
            LocalDateTime startAt,
            LocalDateTime endAt) {

        if (startAt == null) {

            throw new InvalidDiscountException(
                    "Start date is required"
            );
        }

        if (endAt != null
                && endAt.isBefore(startAt)) {

            throw new InvalidDiscountException(
                    "End date cannot be before start date"
            );
        }
    }

    private void validateVariantExists(
            Long productVariantId) {

        if (!productVariantRepository.existsById(
                productVariantId)) {

            throw new InvalidDiscountException(
                    "Product variant not found with id: "
                            + productVariantId
            );
        }
    }

    private ProductVariantDiscountEntity findDiscount(
            Long id) {

        return discountRepository.findById(id)
                .orElseThrow(() ->
                        new ProductVariantDiscountNotFoundException(
                                "Discount not found with id: " + id
                        )
                );
    }

    private void validateNoOverlappingDiscount(
            Long productVariantId,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Long excludeDiscountId) {

        List<ProductVariantDiscountEntity> discounts =
                discountRepository
                        .findByProductVariantIdAndActiveTrueOrderByStartAtDesc(
                                productVariantId
                        );

        for (ProductVariantDiscountEntity existing : discounts) {

            if (excludeDiscountId != null
                    && existing.getId().equals(
                    excludeDiscountId)) {
                continue;
            }

            if (isOverlapping(
                    startAt,
                    endAt,
                    existing.getStartAt(),
                    existing.getEndAt())) {

                throw new ProductVariantDiscountAlreadyExistsException(
                        "An active discount already exists for the given period"
                );
            }
        }
    }

    private boolean isOverlapping(
            LocalDateTime start1,
            LocalDateTime end1,
            LocalDateTime start2,
            LocalDateTime end2) {

        boolean firstStartsBeforeSecondEnds =
                end2 == null
                        || !start1.isAfter(end2);

        boolean secondStartsBeforeFirstEnds =
                end1 == null
                        || !start2.isAfter(end1);

        return firstStartsBeforeSecondEnds
                && secondStartsBeforeFirstEnds;
    }
}