package com.gesmio.havlook.seller_module.seller_coupon.service;

import com.gesmio.havlook.discount_module.DiscountType;

import com.gesmio.havlook.seller_module.seller.entity.Seller;
import com.gesmio.havlook.seller_module.seller.repository.SellerRepository;

import com.gesmio.havlook.seller_module.seller_coupon.dto.SellerCouponCreateRequest;
import com.gesmio.havlook.seller_module.seller_coupon.dto.SellerCouponResponse;
import com.gesmio.havlook.seller_module.seller_coupon.dto.SellerCouponUpdateRequest;

import com.gesmio.havlook.seller_module.seller_coupon.entity.SellerCouponEntity;

import com.gesmio.havlook.seller_module.seller_coupon.exceptions.SellerCouponAlreadyExistsException;
import com.gesmio.havlook.seller_module.seller_coupon.exceptions.SellerCouponNotFoundException;
import com.gesmio.havlook.seller_module.seller_coupon.exceptions.SellerCouponStateException;
import com.gesmio.havlook.seller_module.seller_coupon.exceptions.SellerCouponValidationException;

import com.gesmio.havlook.seller_module.seller_coupon.repository.SellerCouponRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerCouponServiceImpl
        implements SellerCouponService {

    private final SellerCouponRepository couponRepository;

    private final SellerRepository sellerRepository;

    // =========================================================
    // CREATE COUPON
    // =========================================================

    @Override
    public SellerCouponResponse createCoupon(
            Long sellerId,
            SellerCouponCreateRequest request
    ) {

        if (request == null) {

            throw new SellerCouponValidationException(
                    "Coupon request is required"
            );
        }

        Seller seller =
                getActiveSeller(sellerId);

        String code =
                normalizeCode(request.code());

        if (couponRepository
                .existsBySellerIdAndCodeIgnoreCase(
                        sellerId,
                        code
                )) {

            throw new SellerCouponAlreadyExistsException(
                    "Coupon code already exists"
            );
        }

        validateCouponData(
                request.discountType(),
                request.discountValue(),
                request.minimumOrderAmount(),
                request.maximumDiscountAmount(),
                request.usageLimit(),
                request.perCustomerLimit(),
                request.startAt(),
                request.endAt()
        );

        SellerCouponEntity coupon =
                SellerCouponEntity.builder()
                        .seller(seller)
                        .code(code)
                        .discountType(
                                request.discountType()
                        )
                        .discountValue(
                                request.discountValue()
                        )
                        .minimumOrderAmount(
                                request.minimumOrderAmount()
                        )
                        .maximumDiscountAmount(
                                request.maximumDiscountAmount()
                        )
                        .usageLimit(
                                request.usageLimit()
                        )
                        .usedCount(0)
                        .perCustomerLimit(
                                request.perCustomerLimit()
                        )
                        .startAt(
                                request.startAt()
                        )
                        .endAt(
                                request.endAt()
                        )
                        .active(true)
                        .build();

        SellerCouponEntity savedCoupon =
                couponRepository.save(coupon);

        return toResponse(savedCoupon);
    }

    // =========================================================
    // GET MY COUPONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<SellerCouponResponse> getMyCoupons(
            Long sellerId,
            Pageable pageable
    ) {

        getActiveSeller(sellerId);

        return couponRepository
                .findBySellerId(
                        sellerId,
                        pageable
                )
                .map(this::toResponse);
    }

    // =========================================================
    // GET COUPON BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public SellerCouponResponse getMyCouponById(
            Long sellerId,
            Long couponId
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                getSellerCoupon(
                        sellerId,
                        couponId
                );

        return toResponse(coupon);
    }

    // =========================================================
    // UPDATE COUPON
    // =========================================================

    @Override
    public SellerCouponResponse updateCoupon(
            Long sellerId,
            Long couponId,
            SellerCouponUpdateRequest request
    ) {

        if (request == null) {

            throw new SellerCouponValidationException(
                    "Coupon update request is required"
            );
        }

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                getSellerCoupon(
                        sellerId,
                        couponId
                );

        String code =
                normalizeCode(request.code());

        if (!code.equalsIgnoreCase(
                coupon.getCode()
        )
                && couponRepository
                .existsBySellerIdAndCodeIgnoreCaseAndIdNot(
                        sellerId,
                        code,
                        couponId
                )) {

            throw new SellerCouponAlreadyExistsException(
                    "Coupon code already exists"
            );
        }

        validateCouponData(
                request.discountType(),
                request.discountValue(),
                request.minimumOrderAmount(),
                request.maximumDiscountAmount(),
                request.usageLimit(),
                request.perCustomerLimit(),
                request.startAt(),
                request.endAt()
        );

        coupon.setCode(code);

        coupon.setDiscountType(
                request.discountType()
        );

        coupon.setDiscountValue(
                request.discountValue()
        );

        coupon.setMinimumOrderAmount(
                request.minimumOrderAmount()
        );

        coupon.setMaximumDiscountAmount(
                request.maximumDiscountAmount()
        );

        coupon.setUsageLimit(
                request.usageLimit()
        );

        coupon.setPerCustomerLimit(
                request.perCustomerLimit()
        );

        coupon.setStartAt(
                request.startAt()
        );

        coupon.setEndAt(
                request.endAt()
        );

        SellerCouponEntity updatedCoupon =
                couponRepository.save(coupon);

        return toResponse(updatedCoupon);
    }

    // =========================================================
    // ACTIVATE COUPON
    // =========================================================

    @Override
    public void activateCoupon(
            Long sellerId,
            Long couponId
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                getSellerCoupon(
                        sellerId,
                        couponId
                );

        validateDateRange(
                coupon.getStartAt(),
                coupon.getEndAt()
        );

        if (coupon.isActive()) {

            throw new SellerCouponStateException(
                    "Coupon is already active"
            );
        }

        coupon.setActive(true);

        couponRepository.save(coupon);
    }

    // =========================================================
    // DEACTIVATE COUPON
    // =========================================================

    @Override
    public void deactivateCoupon(
            Long sellerId,
            Long couponId
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                getSellerCoupon(
                        sellerId,
                        couponId
                );

        if (!coupon.isActive()) {

            throw new SellerCouponStateException(
                    "Coupon is already inactive"
            );
        }

        coupon.setActive(false);

        couponRepository.save(coupon);
    }

    // =========================================================
    // DELETE COUPON
    // =========================================================

    @Override
    public void deleteCoupon(
            Long sellerId,
            Long couponId
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                getSellerCoupon(
                        sellerId,
                        couponId
                );

        if (coupon.getUsedCount() != null
                && coupon.getUsedCount() > 0) {

            throw new SellerCouponStateException(
                    "Used coupon cannot be deleted. Deactivate it instead."
            );
        }

        couponRepository.delete(coupon);
    }

    // =========================================================
    // GET ACTIVE SELLER
    // =========================================================

    private Seller getActiveSeller(
            Long sellerId
    ) {

        if (sellerId == null ||
                sellerId <= 0) {

            throw new SellerCouponValidationException(
                    "Invalid seller id"
            );
        }

        Seller seller =
                sellerRepository
                        .findById(sellerId)
                        .orElseThrow(() ->
                                new SellerCouponNotFoundException(
                                        "Seller not found"
                                )
                        );

        if (!seller.isActive()) {

            throw new SellerCouponStateException(
                    "Seller account is inactive"
            );
        }

        return seller;
    }

    // =========================================================
    // GET SELLER COUPON
    // =========================================================

    private SellerCouponEntity getSellerCoupon(
            Long sellerId,
            Long couponId
    ) {

        if (couponId == null ||
                couponId <= 0) {

            throw new SellerCouponValidationException(
                    "Invalid coupon id"
            );
        }

        return couponRepository
                .findByIdAndSellerId(
                        couponId,
                        sellerId
                )
                .orElseThrow(() ->
                        new SellerCouponNotFoundException(
                                "Coupon not found"
                        )
                );
    }

    // =========================================================
    // NORMALIZE COUPON CODE
    // =========================================================

    private String normalizeCode(
            String code
    ) {

        if (code == null ||
                code.isBlank()) {

            throw new SellerCouponValidationException(
                    "Coupon code is required"
            );
        }

        return code
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    // =========================================================
    // VALIDATE COUPON DATA
    // =========================================================

    private void validateCouponData(
            DiscountType discountType,
            BigDecimal discountValue,
            BigDecimal minimumOrderAmount,
            BigDecimal maximumDiscountAmount,
            Integer usageLimit,
            Integer perCustomerLimit,
            LocalDateTime startAt,
            LocalDateTime endAt
    ) {

        // -----------------------------------------------------
        // DISCOUNT TYPE
        // -----------------------------------------------------

        if (discountType == null) {

            throw new SellerCouponValidationException(
                    "Discount type is required"
            );
        }

        // -----------------------------------------------------
        // DISCOUNT VALUE
        // -----------------------------------------------------

        if (discountValue == null
                || discountValue.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            throw new SellerCouponValidationException(
                    "Discount value must be greater than 0"
            );
        }

        // -----------------------------------------------------
        // MINIMUM ORDER AMOUNT
        // -----------------------------------------------------

        if (minimumOrderAmount != null
                && minimumOrderAmount.compareTo(
                        BigDecimal.ZERO
                ) < 0) {

            throw new SellerCouponValidationException(
                    "Minimum order amount cannot be negative"
            );
        }

        // -----------------------------------------------------
        // MAXIMUM DISCOUNT AMOUNT
        // -----------------------------------------------------

        if (maximumDiscountAmount != null
                && maximumDiscountAmount.compareTo(
                        BigDecimal.ZERO
                ) < 0) {

            throw new SellerCouponValidationException(
                    "Maximum discount amount cannot be negative"
            );
        }

        // -----------------------------------------------------
        // USAGE LIMIT
        // -----------------------------------------------------

        if (usageLimit != null &&
                usageLimit < 1) {

            throw new SellerCouponValidationException(
                    "Usage limit must be at least 1"
            );
        }

        // -----------------------------------------------------
        // PER CUSTOMER LIMIT
        // -----------------------------------------------------

        if (perCustomerLimit != null &&
                perCustomerLimit < 1) {

            throw new SellerCouponValidationException(
                    "Per customer limit must be at least 1"
            );
        }

        // -----------------------------------------------------
        // DATE RANGE
        // -----------------------------------------------------

        validateDateRange(
                startAt,
                endAt
        );

        // -----------------------------------------------------
        // PERCENTAGE DISCOUNT
        // -----------------------------------------------------

        if (discountType == DiscountType.PERCENTAGE
                && discountValue.compareTo(
                        new BigDecimal("100")
                ) > 0) {

            throw new SellerCouponValidationException(
                    "Percentage discount cannot exceed 100"
            );
        }
    }

    // =========================================================
    // VALIDATE DATE RANGE
    // =========================================================

    private void validateDateRange(
            LocalDateTime startAt,
            LocalDateTime endAt
    ) {

        if (startAt == null) {

            throw new SellerCouponValidationException(
                    "Start date is required"
            );
        }

        if (endAt != null
                && !endAt.isAfter(startAt)) {

            throw new SellerCouponValidationException(
                    "End date must be after start date"
            );
        }
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private SellerCouponResponse toResponse(
            SellerCouponEntity coupon
    ) {

        return SellerCouponResponse.builder()

                .id(
                        coupon.getId()
                )

                .sellerId(
                        coupon.getSeller()
                                .getId()
                )

                .code(
                        coupon.getCode()
                )

                .discountType(
                        coupon.getDiscountType()
                )

                .discountValue(
                        coupon.getDiscountValue()
                )

                .minimumOrderAmount(
                        coupon.getMinimumOrderAmount()
                )

                .maximumDiscountAmount(
                        coupon.getMaximumDiscountAmount()
                )

                .usageLimit(
                        coupon.getUsageLimit()
                )

                .usedCount(
                        coupon.getUsedCount()
                )

                .perCustomerLimit(
                        coupon.getPerCustomerLimit()
                )

                .startAt(
                        coupon.getStartAt()
                )

                .endAt(
                        coupon.getEndAt()
                )

                .active(
                        coupon.isActive()
                )

                .createdAt(
                        coupon.getCreatedAt()
                )

                .updatedAt(
                        coupon.getUpdatedAt()
                )

                .build();
    }
}