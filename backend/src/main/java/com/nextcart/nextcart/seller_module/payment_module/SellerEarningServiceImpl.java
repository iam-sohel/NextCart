package com.nextcart.nextcart.seller_module.payment_module;

import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.order_module.OrderItemEntity;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningEntity;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningStatus;
import com.nextcart.nextcart.seller_module.payment_module.SellerEarningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerEarningServiceImpl implements SellerEarningService {

    private final SellerEarningRepository sellerEarningRepository;

    // =========================================================
    // CREATE SELLER EARNINGS
    // =========================================================

    @Override
    public void createEarningsForOrder(OrderEntity order) {

        if (order == null || order.getItems() == null) {
            return;
        }

        for (OrderItemEntity orderItem : order.getItems()) {

            if (orderItem == null ||
                    orderItem.getId() == null ||
                    orderItem.getProduct() == null ||
                    orderItem.getProduct().getSeller() == null) {
                continue;
            }

            /*
             * Idempotency:
             *
             * A payment can be processed through verification,
             * reconciliation or webhook. The same order must
             * never create duplicate seller earnings.
             */
            if (sellerEarningRepository
                    .existsByOrderItemId(orderItem.getId())) {
                continue;
            }

            BigDecimal grossAmount =
                    orderItem.getLineTotal() == null
                            ? BigDecimal.ZERO
                            : orderItem.getLineTotal();

            BigDecimal commissionAmount =
                    BigDecimal.ZERO;

            BigDecimal netAmount =
                    grossAmount.subtract(commissionAmount);

            SellerEarningEntity earning =
                    SellerEarningEntity.builder()
                            .seller(
                                    orderItem
                                            .getProduct()
                                            .getSeller()
                            )
                            .order(order)
                            .orderItem(orderItem)
                            .grossAmount(grossAmount)
                            .commissionAmount(commissionAmount)
                            .netAmount(netAmount)
                            .status(SellerEarningStatus.PENDING)
                            .build();

            sellerEarningRepository.save(earning);
        }
    }

    // =========================================================
    // MARK EARNINGS REFUNDED
    // =========================================================

    @Override
    public void markEarningsRefunded(OrderEntity order) {

        if (order == null || order.getItems() == null) {
            return;
        }

        for (OrderItemEntity orderItem : order.getItems()) {

            if (orderItem == null ||
                    orderItem.getId() == null) {
                continue;
            }

            sellerEarningRepository
                    .findByOrderItemId(orderItem.getId())
                    .ifPresent(earning -> {

                        if (earning.getStatus() !=
                                SellerEarningStatus.REFUNDED) {

                            earning.setStatus(
                                    SellerEarningStatus.REFUNDED
                            );

                            sellerEarningRepository.save(earning);
                        }
                    });
        }
    }
}