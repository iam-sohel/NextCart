package com.nextcart.nextcart.order_module.dto;

import com.nextcart.nextcart.order_module.entity.OrderStatus;
import com.nextcart.nextcart.order_module.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private String shippingFullName;
    private String shippingStreetAddress;
    private String shippingCity;
    private String shippingPostalCode;
    private List<OrderItemResponseDTO> items;
    private LocalDateTime createdAt;
}
