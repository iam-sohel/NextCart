package com.nextcart.nextcart.seller_module.seller_coupon;

import com.nextcart.nextcart.discount_module.DiscountType;
import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponCreateRequest;
import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponResponse;
import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponUpdateRequest;
import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponEntity;
import com.nextcart.nextcart.seller_module.seller_coupon.SellerCouponRepository;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
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
public class SellerCouponServiceImpl implements SellerCouponService {

    private final SellerCouponRepository couponRepository;
    private final SellerRepository sellerRepository;

    @Override
    public SellerCouponResponse createCoupon(
            Long sellerId,
            SellerCouponCreateRequest request
    ) {

        Seller seller = getActiveSeller(sellerId);

        String code = normalizeCode(request.code());

        if (couponRepository.existsBySellerIdAndCodeIgnoreCase(sellerId, code)) {
            throw new IllegalArgumentException(
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

        SellerCouponEntity coupon = SellerCouponEntity.builder()
                .seller(seller)
                .code(code)
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .minimumOrderAmount(request.minimumOrderAmount())
                .maximumDiscountAmount(request.maximumDiscountAmount())
                .usageLimit(request.usageLimit())
                .usedCount(0)
                .perCustomerLimit(request.perCustomerLimit())
                .startAt(request.startAt())
                .endAt(request.endAt())
                .active(true)
                .build();

        return toResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SellerCouponResponse> getMyCoupons(
            Long sellerId,
            Pageable pageable
    ) {

        getActiveSeller(sellerId);

        return couponRepository
                .findBySellerId(sellerId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SellerCouponResponse getMyCouponById(
            Long sellerId,
            Long couponId
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                couponRepository
                        .findByIdAndSellerId(couponId, sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Coupon not found"
                                )
                        );

        return toResponse(coupon);
    }

    @Override
    public SellerCouponResponse updateCoupon(
            Long sellerId,
            Long couponId,
            SellerCouponUpdateRequest request
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                couponRepository
                        .findByIdAndSellerId(couponId, sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Coupon not found"
                                )
                        );

        String code = normalizeCode(request.code());

        if (!code.equalsIgnoreCase(coupon.getCode())
                && couponRepository
                .existsBySellerIdAndCodeIgnoreCaseAndIdNot(
                        sellerId,
                        code,
                        couponId
                )) {

            throw new IllegalArgumentException(
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
        coupon.setDiscountType(request.discountType());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMinimumOrderAmount(request.minimumOrderAmount());
        coupon.setMaximumDiscountAmount(
                request.maximumDiscountAmount()
        );
        coupon.setUsageLimit(request.usageLimit());
        coupon.setPerCustomerLimit(request.perCustomerLimit());
        coupon.setStartAt(request.startAt());
        coupon.setEndAt(request.endAt());

        return toResponse(couponRepository.save(coupon));
    }

    @Override
    public void activateCoupon(
            Long sellerId,
            Long couponId
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                getSellerCoupon(sellerId, couponId);

        validateDateRange(
                coupon.getStartAt(),
                coupon.getEndAt()
        );

        coupon.setActive(true);
        couponRepository.save(coupon);
    }

    @Override
    public void deactivateCoupon(
            Long sellerId,
            Long couponId
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                getSellerCoupon(sellerId, couponId);

        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    @Override
    public void deleteCoupon(
            Long sellerId,
            Long couponId
    ) {

        getActiveSeller(sellerId);

        SellerCouponEntity coupon =
                getSellerCoupon(sellerId, couponId);

        if (coupon.getUsedCount() != null
                && coupon.getUsedCount() > 0) {

            throw new IllegalStateException(
                    "Used coupon cannot be deleted. Deactivate it instead."
            );
        }

        couponRepository.delete(coupon);
    }

    private Seller getActiveSeller(Long sellerId) {

        Seller seller =
                sellerRepository
                        .findById(sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Seller not found"
                                )
                        );

        if (!seller.isActive()) {
            throw new IllegalStateException(
                    "Seller account is inactive"
            );
        }

        return seller;
    }

    private SellerCouponEntity getSellerCoupon(
            Long sellerId,
            Long couponId
    ) {

        return couponRepository
                .findByIdAndSellerId(couponId, sellerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Coupon not found"
                        )
                );
    }

    private String normalizeCode(String code) {

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException(
                    "Coupon code is required"
            );
        }

        return code.trim().toUpperCase(Locale.ROOT);
    }

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

        if (discountType == null) {
            throw new IllegalArgumentException(
                    "Discount type is required"
            );
        }

        if (discountValue == null
                || discountValue.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Discount value must be greater than 0"
            );
        }

        if (minimumOrderAmount != null
                && minimumOrderAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Minimum order amount cannot be negative"
            );
        }

        if (maximumDiscountAmount != null
                && maximumDiscountAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Maximum discount amount cannot be negative"
            );
        }

        if (usageLimit != null && usageLimit < 1) {
            throw new IllegalArgumentException(
                    "Usage limit must be at least 1"
            );
        }

        if (perCustomerLimit != null && perCustomerLimit < 1) {
            throw new IllegalArgumentException(
                    "Per customer limit must be at least 1"
            );
        }

        validateDateRange(startAt, endAt);

        if (discountType == DiscountType.PERCENTAGE
                && discountValue.compareTo(new BigDecimal("100")) > 0) {

            throw new IllegalArgumentException(
                    "Percentage discount cannot exceed 100"
            );
        }
    }

    private void validateDateRange(
            LocalDateTime startAt,
            LocalDateTime endAt
    ) {

        if (startAt == null) {
            throw new IllegalArgumentException(
                    "Start date is required"
            );
        }

        if (endAt != null && !endAt.isAfter(startAt)) {
            throw new IllegalArgumentException(
                    "End date must be after start date"
            );
        }
    }

    private SellerCouponResponse toResponse(
            SellerCouponEntity coupon
    ) {

        return SellerCouponResponse.builder()
                .id(coupon.getId())
                .sellerId(coupon.getSeller().getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minimumOrderAmount(
                        coupon.getMinimumOrderAmount()
                )
                .maximumDiscountAmount(
                        coupon.getMaximumDiscountAmount()
                )
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .perCustomerLimit(
                        coupon.getPerCustomerLimit()
                )
                .startAt(coupon.getStartAt())
                .endAt(coupon.getEndAt())
                .active(coupon.isActive())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
}