package com.nextcart.nextcart.order_module.service;

import com.nextcart.nextcart.address_module.entity.Address;
import com.nextcart.nextcart.address_module.repository.AddressRepository;
import com.nextcart.nextcart.cart_module.entity.Cart;
import com.nextcart.nextcart.cart_module.repository.CartRepository;
import com.nextcart.nextcart.order_module.dto.*;
import com.nextcart.nextcart.order_module.entity.*;
import com.nextcart.nextcart.order_module.repository.OrderRepository;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;

    @Override
    @Transactional
    public OrderResponseDTO createOrderFromCart(
            String userEmail,
            CheckoutRequestDTO requestDto) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Address address = addressRepository
                .findByIdAndUser(requestDto.getAddressId(), user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Address not found or access denied"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Cart is empty"));

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Cannot place order with empty cart");
        }

        // Calculate total using ProductVariant price
        BigDecimal calculatedTotal = cart.getItems()
                .stream()
                .filter(item ->
                        item.getProductVariant() != null &&
                                item.getProductVariant().getPrice() != null)
                .map(item ->
                        item.getProductVariant()
                                .getPrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                item.getQuantity())))
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add);

        BigDecimal finalTotal =
                (cart.getTotalAmount() != null &&
                        cart.getTotalAmount()
                                .compareTo(BigDecimal.ZERO) > 0)
                        ? cart.getTotalAmount()
                        : calculatedTotal;

        Order order = Order.builder()
                .user(user)
                .orderNumber(
                        "ORD-" +
                                UUID.randomUUID()
                                        .toString()
                                        .substring(0, 8)
                                        .toUpperCase())
                .status(OrderStatus.PENDING)
                .paymentStatus(
                        "COD".equalsIgnoreCase(
                                requestDto.getPaymentMethod())
                                ? PaymentStatus.PENDING
                                : PaymentStatus.COMPLETED)
                .paymentMethod(
                        requestDto.getPaymentMethod())
                .shippingFullName(
                        address.getFullName())
                .shippingPhoneNumber(
                        address.getPhoneNumber())
                .shippingStreetAddress(
                        address.getStreetAddress())
                .shippingLandmark(
                        address.getLandmark())
                .shippingCity(
                        address.getCity())
                .shippingState(
                        address.getState())
                .shippingPostalCode(
                        address.getPostalCode())
                .shippingCountry(
                        address.getCountry())
                .totalAmount(finalTotal)
                .build();

        List<OrderItem> orderItems =
                cart.getItems()
                        .stream()
                        .map(cartItem ->
                                OrderItem.builder()
                                        .order(order)
                                        .product(
                                                cartItem.getProduct())
                                        .productName(
                                                cartItem.getProduct()
                                                        .getName())
                                        .quantity(
                                                cartItem.getQuantity())
                                        .price(
                                                cartItem
                                                        .getProductVariant()
                                                        .getPrice())
                                        .build()
                        )
                        .collect(Collectors.toList());

        order.setItems(orderItems);

        Order savedOrder =
                orderRepository.save(order);

        // Clear user cart after checkout
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);

        return mapToResponseDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        return orderRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(
            String userEmail,
            Long orderId) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Order order = orderRepository
                .findByIdAndUser(orderId, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"));

        return mapToResponseDTO(order);
    }

    @Override
    @Transactional
    public OrderResponseDTO cancelOrder(
            String userEmail,
            Long orderId) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));

        Order order = orderRepository
                .findByIdAndUser(orderId, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"));

        if (order.getStatus() == OrderStatus.DELIVERED ||
                order.getStatus() == OrderStatus.SHIPPED) {

            throw new RuntimeException(
                    "Cannot cancel order that is already shipped or delivered");
        }

        order.setStatus(OrderStatus.CANCELLED);

        Order updatedOrder =
                orderRepository.save(order);

        return mapToResponseDTO(updatedOrder);
    }

    private OrderResponseDTO mapToResponseDTO(
            Order order) {

        List<OrderItemResponseDTO> itemDTOs =
                order.getItems()
                        .stream()
                        .map(item ->
                                OrderItemResponseDTO.builder()
                                        .id(item.getId())
                                        .productId(
                                                item.getProduct()
                                                        .getId())
                                        .productName(
                                                item.getProductName())
                                        .quantity(
                                                item.getQuantity())
                                        .price(
                                                item.getPrice())
                                        .build()
                        )
                        .collect(Collectors.toList());

        return OrderResponseDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .paymentStatus(
                        order.getPaymentStatus())
                .paymentMethod(
                        order.getPaymentMethod())
                .totalAmount(
                        order.getTotalAmount())
                .shippingFullName(
                        order.getShippingFullName())
                .shippingStreetAddress(
                        order.getShippingStreetAddress())
                .shippingCity(
                        order.getShippingCity())
                .shippingPostalCode(
                        order.getShippingPostalCode())
                .items(itemDTOs)
                .createdAt(
                        order.getCreatedAt())
                .build();
    }
}