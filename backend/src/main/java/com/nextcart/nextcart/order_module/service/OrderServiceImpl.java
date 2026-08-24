package com.nextcart.nextcart.order_module.service;

import com.nextcart.nextcart.cart_module.entity.Cart;
import com.nextcart.nextcart.cart_module.repository.CartRepository;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import com.nextcart.nextcart.order_module.entity.Order;
import com.nextcart.nextcart.order_module.entity.OrderItem;
import com.nextcart.nextcart.order_module.repository.OrderRepository;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductVariantPriceRepository productVariantPriceRepository;

    @Override
    public OrderResponseDTO createOrder(
            Long userId) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found with id: " + userId
                                )
                        );

        Cart cart =
                cartRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart not found for user id: " + userId
                                )
                        );

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Cannot create order from empty cart"
            );
        }

        BigDecimal calculatedTotal =
                cart.getItems()
                        .stream()
                        .map(item -> {

                            ProductVariantPriceEntity price =
                                    productVariantPriceRepository
                                            .findByProductVariant_Id(
                                                    item.getProductVariant().getId()
                                            )
                                            .orElseThrow(() ->
                                                    new RuntimeException(
                                                            "Price not found for product variant id: "
                                                                    + item.getProductVariant().getId()
                                                    )
                                            );

                            return price.getSellingPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    item.getQuantity()
                                            )
                                    );
                        })
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        Order order = Order.builder()
                .user(user)
                .totalAmount(calculatedTotal)
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems =
                cart.getItems()
                        .stream()
                        .map(cartItem -> {

                            ProductVariantPriceEntity price =
                                    productVariantPriceRepository
                                            .findByProductVariant_Id(
                                                    cartItem
                                                            .getProductVariant()
                                                            .getId()
                                            )
                                            .orElseThrow(() ->
                                                    new RuntimeException(
                                                            "Price not found for product variant id: "
                                                                    + cartItem
                                                                    .getProductVariant()
                                                                    .getId()
                                                    )
                                            );

                            return OrderItem.builder()
                                    .order(order)
                                    .productEntity(
                                            cartItem.getProductEntity()
                                    )
                                    .productName(
                                            cartItem
                                                    .getProductEntity()
                                                    .getName()
                                    )
                                    .quantity(
                                            cartItem.getQuantity()
                                    )
                                    .price(
                                            price.getSellingPrice()
                                    )
                                    .build();
                        })
                        .toList();

        order.setItems(orderItems);

        Order savedOrder =
                orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(
            Long orderId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found with id: "
                                                + orderId
                                )
                        );

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(
            Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException(
                    "User not found with id: " + userId
            );
        }

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public OrderResponseDTO updateOrderStatus(
            Long orderId,
            OrderStatus status) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found with id: "
                                                + orderId
                                )
                        );

        order.setStatus(status);

        return mapToResponse(
                orderRepository.save(order)
        );
    }

    private OrderResponseDTO mapToResponse(
            Order order) {

        List<OrderResponseDTO.OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item ->
                                new OrderResponseDTO.OrderItemResponse(
                                        item.getId(),
                                        item.getProductEntity().getId(),
                                        item.getProductName(),
                                        item.getQuantity(),
                                        item.getPrice()
                                )
                        )
                        .toList();

        return new OrderResponseDTO(
                order.getId(),
                order.getUser().getId(),
                order.getTotalAmount(),
                order.getStatus(),
                items,
                order.getCreatedAt()
        );
    }
}