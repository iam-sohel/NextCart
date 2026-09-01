package com.nextcart.nextcart.order_module.dto;

import com.nextcart.nextcart.order_module.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long id;

    private String orderNumber;

    private OrderStatus status;

    // =========================================================
    // PAYMENT
    // =========================================================
    //
    // Payment must be completed before this timestamp.
    //
    // Example:
    // Order created      : 10:00 AM
    // Payment expires at : 10:15 AM
    //
    // Frontend can use this value to display the countdown.
    // Backend remains the source of truth.
    // =========================================================

    private LocalDateTime paymentExpiresAt;


    // =========================================================
    // SHIPPING ADDRESS SNAPSHOT
    // =========================================================

    private String shippingFullName;

    private String shippingPhoneNumber;

    private String shippingStreetAddress;

    private String shippingLandmark;

    private String shippingCity;

    private String shippingState;

    private String shippingPostalCode;

    private String shippingCountry;


    // =========================================================
    // PRICE
    // =========================================================

    private BigDecimal subtotal;

    private BigDecimal discountAmount;

    private BigDecimal shippingCharge;

    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private String currency;


    // =========================================================
    // ITEMS
    // =========================================================

    private List<OrderItemResponseDTO> items;


    // =========================================================
    // TIMESTAMPS
    // =========================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}