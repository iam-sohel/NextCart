package com.nextcart.nextcart.seller_module.payment_module;

import com.nextcart.nextcart.order_module.OrderItemEntity;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningResponse;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningSummaryResponse;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningEntity;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningStatus;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerPaymentServiceImpl implements SellerPaymentService {

    private final SellerEarningRepository sellerEarningRepository;

    // =========================================================
    // GET MY EARNINGS
    // =========================================================

    @Override
    public Page<SellerEarningResponse> getMyEarnings(
            Long sellerId,
            Pageable pageable) {

        validateId(sellerId, "Seller ID");

        return sellerEarningRepository
                .findBySellerId(sellerId, pageable)
                .map(this::mapToResponse);
    }

    // =========================================================
    // GET SINGLE EARNING
    // =========================================================

    @Override
    public SellerEarningResponse getMyEarningById(
            Long sellerId,
            Long earningId) {

        validateId(sellerId, "Seller ID");
        validateId(earningId, "Earning ID");

        SellerEarningEntity earning =
                sellerEarningRepository
                        .findByIdAndSellerId(earningId, sellerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Earning not found with id: " + earningId
                                )
                        );

        return mapToResponse(earning);
    }

    // =========================================================
    // GET EARNINGS BY ORDER
    // =========================================================

    @Override
    public Page<SellerEarningResponse> getMyEarningsByOrder(
            Long sellerId,
            Long orderId,
            Pageable pageable) {

        validateId(sellerId, "Seller ID");
        validateId(orderId, "Order ID");

        return sellerEarningRepository
                .findBySellerIdAndOrderId(
                        sellerId,
                        orderId,
                        pageable
                )
                .map(this::mapToResponse);
    }

    // =========================================================
    // GET EARNINGS SUMMARY
    // =========================================================

    @Override
    public SellerEarningSummaryResponse getMyEarningsSummary(
            Long sellerId) {

        validateId(sellerId, "Seller ID");

        List<SellerEarningEntity> earnings =
                sellerEarningRepository
                        .findBySellerId(
                                sellerId,
                                Pageable.unpaged()
                        )
                        .getContent();

        BigDecimal totalGrossAmount = BigDecimal.ZERO;
        BigDecimal totalCommissionAmount = BigDecimal.ZERO;
        BigDecimal totalNetAmount = BigDecimal.ZERO;

        BigDecimal pendingAmount = BigDecimal.ZERO;
        BigDecimal availableAmount = BigDecimal.ZERO;
        BigDecimal paidAmount = BigDecimal.ZERO;
        BigDecimal refundedAmount = BigDecimal.ZERO;

        long pendingRecords = 0;
        long availableRecords = 0;
        long paidRecords = 0;
        long refundedRecords = 0;

        for (SellerEarningEntity earning : earnings) {

            BigDecimal grossAmount =
                    safeAmount(earning.getGrossAmount());

            BigDecimal commissionAmount =
                    safeAmount(earning.getCommissionAmount());

            BigDecimal netAmount =
                    safeAmount(earning.getNetAmount());

            totalGrossAmount =
                    totalGrossAmount.add(grossAmount);

            totalCommissionAmount =
                    totalCommissionAmount.add(commissionAmount);

            totalNetAmount =
                    totalNetAmount.add(netAmount);

            SellerEarningStatus status =
                    earning.getStatus();

            if (status == null) {
                continue;
            }

            switch (status) {

                case PENDING -> {
                    pendingAmount =
                            pendingAmount.add(netAmount);
                    pendingRecords++;
                }

                case AVAILABLE -> {
                    availableAmount =
                            availableAmount.add(netAmount);
                    availableRecords++;
                }

                case PAID -> {
                    paidAmount =
                            paidAmount.add(netAmount);
                    paidRecords++;
                }

                case REFUNDED -> {
                    refundedAmount =
                            refundedAmount.add(netAmount);
                    refundedRecords++;
                }
            }
        }

        return SellerEarningSummaryResponse.builder()
                .sellerId(sellerId)
                .totalGrossAmount(totalGrossAmount)
                .totalCommissionAmount(totalCommissionAmount)
                .totalNetAmount(totalNetAmount)
                .pendingAmount(pendingAmount)
                .availableAmount(availableAmount)
                .paidAmount(paidAmount)
                .refundedAmount(refundedAmount)
                .totalEarningRecords(earnings.size())
                .pendingRecords(pendingRecords)
                .availableRecords(availableRecords)
                .paidRecords(paidRecords)
                .refundedRecords(refundedRecords)
                .build();
    }

    // =========================================================
    // MAP ENTITY → RESPONSE
    // =========================================================

    private SellerEarningResponse mapToResponse(
            SellerEarningEntity earning) {

        OrderItemEntity orderItem =
                earning.getOrderItem();

        return SellerEarningResponse.builder()
                .id(earning.getId())

                .sellerId(
                        earning.getSeller().getId()
                )

                .orderId(
                        earning.getOrder().getId()
                )

                .orderNumber(
                        earning.getOrder().getOrderNumber()
                )

                .orderItemId(
                        orderItem.getId()
                )

                .productId(
                        orderItem.getProduct().getId()
                )

                .productVariantId(
                        orderItem.getProductVariant().getId()
                )

                .productName(
                        orderItem.getProductName()
                )

                .sku(
                        orderItem.getSku()
                )

                .quantity(
                        orderItem.getQuantity()
                )

                .grossAmount(
                        earning.getGrossAmount()
                )

                .commissionAmount(
                        earning.getCommissionAmount()
                )

                .netAmount(
                        earning.getNetAmount()
                )

                .status(
                        earning.getStatus()
                )

                .createdAt(
                        earning.getCreatedAt()
                )

                .updatedAt(
                        earning.getUpdatedAt()
                )

                .build();
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateId(
            Long id,
            String fieldName) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    fieldName + " must be a valid positive number"
            );
        }
    }

    // =========================================================
    // SAFE AMOUNT
    // =========================================================

    private BigDecimal safeAmount(
            BigDecimal amount) {

        return amount == null
                ? BigDecimal.ZERO
                : amount;
    }
}