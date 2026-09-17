package com.nextcart.nextcart.seller_module.order_module;

import com.nextcart.nextcart.order_module.OrderEntity;
import com.nextcart.nextcart.order_module.OrderItemEntity;
import com.nextcart.nextcart.order_module.OrderStatus;
import com.nextcart.nextcart.order_module.dto.OrderItemResponseDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import com.nextcart.nextcart.order_module.exceptions.InvalidOrderStatusException;
import com.nextcart.nextcart.order_module.exceptions.OrderNotFoundException;
import com.nextcart.nextcart.seller_module.order_module.SellerOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerOrderServiceImpl implements SellerOrderService {

    private final SellerOrderRepository sellerOrderRepository;


    // =========================================================
    // SELLER - GET ALL ORDERS
    // =========================================================

    @Override
    public Page<OrderResponseDTO> getMyOrders(
            Long sellerId,
            Pageable pageable
    ) {

        validateSellerId(sellerId);

        return sellerOrderRepository
                .findOrdersBySellerId(sellerId, pageable)
                .map(order -> mapToSellerResponse(order, sellerId));
    }


    // =========================================================
    // SELLER - GET ORDER BY ID
    // =========================================================

    @Override
    public OrderResponseDTO getMyOrderById(
            Long sellerId,
            Long orderId
    ) {

        validateSellerId(sellerId);
        validateOrderId(orderId);

        OrderEntity order =
                sellerOrderRepository
                        .findOrderByIdAndSellerId(
                                orderId,
                                sellerId
                        )
                        .orElseThrow(() ->
                                new OrderNotFoundException(
                                        "Order not found"
                                )
                        );

        return mapToSellerResponse(order, sellerId);
    }


    // =========================================================
    // SELLER - GET ORDERS BY STATUS
    // =========================================================

    @Override
    public Page<OrderResponseDTO> getMyOrdersByStatus(
            Long sellerId,
            OrderStatus status,
            Pageable pageable
    ) {

        validateSellerId(sellerId);

        if (status == null) {
            throw new InvalidOrderStatusException(
                    "Order status is required"
            );
        }

        return sellerOrderRepository
                .findOrdersBySellerIdAndStatus(
                        sellerId,
                        status,
                        pageable
                )
                .map(order -> mapToSellerResponse(order, sellerId));
    }


    // =========================================================
    // SELLER ORDER RESPONSE
    // =========================================================
    //
    // Important:
    // The original OrderEntity can contain products from
    // multiple sellers.
    //
    // Therefore, only OrderItems belonging to this seller
    // are included in the response.
    //
    // Order-level fields remain the original order snapshot.
    // =========================================================

    private OrderResponseDTO mapToSellerResponse(
            OrderEntity order,
            Long sellerId
    ) {

        List<OrderItemResponseDTO> sellerItems =
                new ArrayList<>();

        if (order.getItems() != null) {

            for (OrderItemEntity item : order.getItems()) {

                if (!belongsToSeller(item, sellerId)) {
                    continue;
                }

                sellerItems.add(
                        mapItemToResponse(item)
                );
            }
        }

        return OrderResponseDTO
                .builder()

                // =================================================
                // ORDER
                // =================================================

                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())

                // =================================================
                // PAYMENT
                // =================================================

                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .paymentExpiresAt(order.getPaymentExpiresAt())

                // =================================================
                // SHIPPING
                // =================================================

                .shippingFullName(
                        order.getShippingFullName()
                )
                .shippingPhoneNumber(
                        order.getShippingPhoneNumber()
                )
                .shippingStreetAddress(
                        order.getShippingStreetAddress()
                )
                .shippingLandmark(
                        order.getShippingLandmark()
                )
                .shippingCity(
                        order.getShippingCity()
                )
                .shippingState(
                        order.getShippingState()
                )
                .shippingPostalCode(
                        order.getShippingPostalCode()
                )
                .shippingCountry(
                        order.getShippingCountry()
                )

                // =================================================
                // PRICE
                // =================================================
                //
                // These are the original order-level amounts.
                // Do NOT treat totalAmount as seller earnings.
                //
                // Seller earnings will be handled separately
                // in the Payments/Earnings module.
                // =================================================

                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingCharge(order.getShippingCharge())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())

                // =================================================
                // SELLER ITEMS ONLY
                // =================================================

                .items(sellerItems)

                // =================================================
                // TIMESTAMPS
                // =================================================

                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())

                .build();
    }


    // =========================================================
    // SELLER OWNERSHIP CHECK
    // =========================================================

    private boolean belongsToSeller(
            OrderItemEntity item,
            Long sellerId
    ) {

        if (item == null ||
                item.getProduct() == null ||
                item.getProduct().getSeller() == null ||
                item.getProduct().getSeller().getId() == null) {

            return false;
        }

        return sellerId.equals(
                item.getProduct()
                        .getSeller()
                        .getId()
        );
    }


    // =========================================================
    // ORDER ITEM RESPONSE
    // =========================================================

    private OrderItemResponseDTO mapItemToResponse(
            OrderItemEntity item
    ) {

        if (item == null ||
                item.getProductVariant() == null ||
                item.getProductVariant().getId() == null) {

            throw new IllegalStateException(
                    "Order contains invalid item data"
            );
        }

        return OrderItemResponseDTO
                .builder()

                .id(item.getId())

                .productVariantId(
                        item.getProductVariant().getId()
                )

                .productName(
                        item.getProductName()
                )

                .sku(
                        item.getSku()
                )

                .quantity(
                        item.getQuantity()
                )

                .unitMrp(
                        item.getUnitMrp()
                )

                .unitSellingPrice(
                        item.getUnitSellingPrice()
                )

                .discountAmount(
                        item.getDiscountAmount()
                )

                .lineTotal(
                        item.getLineTotal()
                )

                .build();
    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateSellerId(Long sellerId) {

        if (sellerId == null || sellerId <= 0) {

            throw new IllegalArgumentException(
                    "Invalid seller ID"
            );
        }
    }


    private void validateOrderId(Long orderId) {

        if (orderId == null || orderId <= 0) {

            throw new IllegalArgumentException(
                    "Invalid order ID"
            );
        }
    }
}