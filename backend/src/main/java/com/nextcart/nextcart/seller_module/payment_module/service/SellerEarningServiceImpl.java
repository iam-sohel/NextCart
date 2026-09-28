package com.nextcart.nextcart.seller_module.payment_module.service;

import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.order_module.OrderItemEntity;
import com.nextcart.nextcart.seller_module.payment_module.entity.SellerEarningEntity;
import com.nextcart.nextcart.seller_module.payment_module.entity.SellerEarningStatus;
import com.nextcart.nextcart.seller_module.payment_module.exceptions.InvalidEarningStatusException;
import com.nextcart.nextcart.seller_module.payment_module.exceptions.InvalidOrderException;
import com.nextcart.nextcart.seller_module.payment_module.exceptions.InvalidOrderItemException;
import com.nextcart.nextcart.seller_module.payment_module.exceptions.SellerEarningCreationException;
import com.nextcart.nextcart.seller_module.payment_module.exceptions.SellerEarningNotFoundException;
import com.nextcart.nextcart.seller_module.payment_module.repository.SellerEarningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerEarningServiceImpl
        implements SellerEarningService {

    private final SellerEarningRepository sellerEarningRepository;

    // =========================================================
    // CREATE SELLER EARNINGS
    // =========================================================

    @Override
    public void createEarningsForOrder(
            OrderEntity order) {

        validateOrder(order);

        for (OrderItemEntity orderItem : order.getItems()) {

            if (orderItem == null) {
                continue;
            }

            validateOrderItem(orderItem);

            /*
             * Idempotency:
             *
             * Prevent duplicate earnings when the same order
             * is processed multiple times.
             */
            if (sellerEarningRepository
                    .existsByOrderItemId(
                            orderItem.getId())) {

                continue;
            }

            try {

                BigDecimal grossAmount =
                        getGrossAmount(orderItem);

                BigDecimal commissionAmount =
                        calculateCommission(
                                grossAmount
                        );

                BigDecimal netAmount =
                        grossAmount.subtract(
                                commissionAmount
                        );

                SellerEarningEntity earning =
                        SellerEarningEntity.builder()

                                .seller(
                                        orderItem
                                                .getProduct()
                                                .getSeller()
                                )

                                .order(order)

                                .orderItem(orderItem)

                                .grossAmount(
                                        grossAmount
                                )

                                .commissionAmount(
                                        commissionAmount
                                )

                                .netAmount(
                                        netAmount
                                )

                                .status(
                                        SellerEarningStatus.PENDING
                                )

                                .build();

                sellerEarningRepository.save(
                        earning
                );

            } catch (SellerEarningCreationException ex) {

                throw ex;

            } catch (Exception ex) {

                throw new SellerEarningCreationException(
                        "Failed to create seller earning " +
                        "for order item: " +
                        orderItem.getId(),
                        ex
                );
            }
        }
    }

    // =========================================================
    // MARK EARNINGS REFUNDED
    // =========================================================

    @Override
    public void markEarningsRefunded(
            OrderEntity order) {

        validateOrder(order);

        for (OrderItemEntity orderItem :
                order.getItems()) {

            if (orderItem == null) {
                continue;
            }

            if (orderItem.getId() == null ||
                    orderItem.getId() <= 0) {

                throw new InvalidOrderItemException(
                        "Order item ID must be a valid positive number"
                );
            }

            sellerEarningRepository
                    .findByOrderItemId(
                            orderItem.getId()
                    )
                    .ifPresentOrElse(

                            earning -> {

                                SellerEarningStatus status =
                                        earning.getStatus();

                                // ---------------------------------
                                // ALREADY REFUNDED
                                // ---------------------------------

                                if (status ==
                                        SellerEarningStatus.REFUNDED) {

                                    return;
                                }

                                // ---------------------------------
                                // PAID EARNING
                                // ---------------------------------

                                if (status ==
                                        SellerEarningStatus.PAID) {

                                    throw new InvalidEarningStatusException(
                                            "Paid earning cannot be " +
                                            "refunded directly for " +
                                            "order item: " +
                                            orderItem.getId()
                                    );
                                }

                                // ---------------------------------
                                // MARK REFUNDED
                                // ---------------------------------

                                earning.setStatus(
                                        SellerEarningStatus.REFUNDED
                                );

                                sellerEarningRepository.save(
                                        earning
                                );
                            },

                            () -> {

                                throw new SellerEarningNotFoundException(
                                        "Seller earning not found " +
                                        "for order item: " +
                                        orderItem.getId()
                                );
                            }
                    );
        }
    }

    // =========================================================
    // VALIDATE ORDER
    // =========================================================

    private void validateOrder(
            OrderEntity order) {

        if (order == null) {

            throw new InvalidOrderException(
                    "Order is required"
            );
        }

        if (order.getId() == null ||
                order.getId() <= 0) {

            throw new InvalidOrderException(
                    "Order ID must be a valid positive number"
            );
        }

        if (order.getItems() == null ||
                order.getItems().isEmpty()) {

            throw new InvalidOrderException(
                    "Order must contain at least one item"
            );
        }
    }

    // =========================================================
    // VALIDATE ORDER ITEM
    // =========================================================

    private void validateOrderItem(
            OrderItemEntity orderItem) {

        if (orderItem.getId() == null ||
                orderItem.getId() <= 0) {

            throw new InvalidOrderItemException(
                    "Order item ID must be a valid positive number"
            );
        }

        if (orderItem.getProduct() == null) {

            throw new InvalidOrderItemException(
                    "Product is required for order item: "
                            + orderItem.getId()
            );
        }

        if (orderItem.getProduct().getSeller() == null) {

            throw new InvalidOrderItemException(
                    "Seller is missing for order item: "
                            + orderItem.getId()
            );
        }

        if (orderItem.getLineTotal() == null) {

            throw new InvalidOrderItemException(
                    "Line total is required for order item: "
                            + orderItem.getId()
            );
        }

        if (orderItem.getLineTotal()
                .compareTo(BigDecimal.ZERO) < 0) {

            throw new InvalidOrderItemException(
                    "Line total cannot be negative for " +
                    "order item: " +
                    orderItem.getId()
            );
        }
    }

    // =========================================================
    // GET GROSS AMOUNT
    // =========================================================

    private BigDecimal getGrossAmount(
            OrderItemEntity orderItem) {

        return orderItem.getLineTotal();
    }

    // =========================================================
    // CALCULATE COMMISSION
    // =========================================================

    private BigDecimal calculateCommission(
            BigDecimal grossAmount) {

        /*
         * Currently NextCart commission is 0%.
         *
         * Replace this method when commission rules
         * are implemented.
         */

        return BigDecimal.ZERO;
    }
}