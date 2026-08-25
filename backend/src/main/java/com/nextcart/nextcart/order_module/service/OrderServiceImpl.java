package com.nextcart.nextcart.order_module.service;

import com.nextcart.nextcart.address_module.entity.Address;
import com.nextcart.nextcart.address_module.repository.AddressRepository;
import com.nextcart.nextcart.cart_module.entity.Cart;
import com.nextcart.nextcart.cart_module.entity.CartItem;
import com.nextcart.nextcart.cart_module.repository.CartRepository;
import com.nextcart.nextcart.order_module.dto.CheckoutRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderItemResponseDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import com.nextcart.nextcart.order_module.entity.Order;
import com.nextcart.nextcart.order_module.entity.OrderItem;
import com.nextcart.nextcart.order_module.entity.OrderStatus;
import com.nextcart.nextcart.order_module.entity.PaymentStatus;
import com.nextcart.nextcart.order_module.repository.OrderRepository;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantPriceRepository productVariantPriceRepository;

    // =========================================================
    // CREATE ORDER FROM CART
    // =========================================================

    @Override
    public OrderResponseDTO createOrderFromCart(
            String userEmail,
            CheckoutRequestDTO requestDto) {

        User user = getUserByEmail(userEmail);

        Address address =
                addressRepository
                        .findByIdAndUser(
                                requestDto.getAddressId(),
                                user
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found with id: "
                                                + requestDto.getAddressId()
                                )
                        );

        Cart cart =
                cartRepository
                        .findByUser(user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart not found for user"
                                )
                        );

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Cannot create order from empty cart"
            );
        }

        /*
         * Calculate total using the current selling price
         * of every product variant.
         */
        BigDecimal totalAmount =
                cart.getItems()
                        .stream()
                        .map(this::calculateItemTotal)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        /*
         * Create order.
         */
        Order order =
                Order.builder()
                        .user(user)
                        .orderNumber(generateOrderNumber())
                        .status(OrderStatus.PENDING)
                        .paymentStatus(PaymentStatus.PENDING)
                        .paymentMethod(
                                requestDto.getPaymentMethod()
                        )
                        .totalAmount(totalAmount)

                        /*
                         * Store shipping address as a snapshot.
                         * This prevents future address changes
                         * from modifying the old order.
                         */
                        .shippingFullName(
                                address.getFullName()
                        )
                        .shippingPhoneNumber(
                                address.getPhoneNumber()
                        )
                        .shippingStreetAddress(
                                address.getStreetAddress()
                        )
                        .shippingLandmark(
                                address.getLandmark()
                        )
                        .shippingCity(
                                address.getCity()
                        )
                        .shippingState(
                                address.getState()
                        )
                        .shippingPostalCode(
                                address.getPostalCode()
                        )
                        .shippingCountry(
                                address.getCountry()
                        )
                        .items(new ArrayList<>())
                        .build();

        /*
         * Create order items.
         *
         * The current selling price is copied into OrderItem.
         * Future price changes will not modify old orders.
         */
        List<OrderItem> orderItems =
                cart.getItems()
                        .stream()
                        .map(cartItem ->
                                createOrderItem(
                                        order,
                                        cartItem
                                )
                        )
                        .toList();

        order.setItems(
                new ArrayList<>(orderItems)
        );

        Order savedOrder =
                orderRepository.save(order);

        /*
         * Clear cart after successful order creation.
         */
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);

        cartRepository.save(cart);

        return mapToResponse(savedOrder);
    }

    // =========================================================
    // GET USER ORDERS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(
            String userEmail) {

        User user =
                getUserByEmail(userEmail);

        return orderRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(
            String userEmail,
            Long orderId) {

        User user =
                getUserByEmail(userEmail);

        Order order =
                orderRepository
                        .findByIdAndUser(
                                orderId,
                                user
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found with id: "
                                                + orderId
                                )
                        );

        return mapToResponse(order);
    }

    // =========================================================
    // CANCEL ORDER
    // =========================================================

    @Override
    public OrderResponseDTO cancelOrder(
            String userEmail,
            Long orderId) {

        User user =
                getUserByEmail(userEmail);

        Order order =
                orderRepository
                        .findByIdAndUser(
                                orderId,
                                user
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found with id: "
                                                + orderId
                                )
                        );

        /*
         * Only PENDING orders can be canceled.
         */
        if (order.getStatus() != OrderStatus.PENDING) {

            throw new RuntimeException(
                    "Order cannot be canceled when status is "
                            + order.getStatus()
            );
        }

        order.setStatus(
                OrderStatus.CANCELLED
        );

        /*
         * Payment has not been completed yet.
         */
        order.setPaymentStatus(
                PaymentStatus.PENDING
        );

        Order savedOrder =
                orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    // =========================================================
    // GET USER BY EMAIL
    // =========================================================

    private User getUserByEmail(
            String userEmail) {

        if (userEmail == null ||
                userEmail.isBlank()) {

            throw new RuntimeException(
                    "User email is required"
            );
        }

        return userRepository
                .findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: "
                                        + userEmail
                        )
                );
    }

    // =========================================================
    // CALCULATE ITEM TOTAL
    // =========================================================

    private BigDecimal calculateItemTotal(
            CartItem cartItem) {

        if (cartItem.getProductVariant() == null) {

            throw new RuntimeException(
                    "Product variant not found for cart item: "
                            + cartItem.getId()
            );
        }

        Long variantId =
                cartItem
                        .getProductVariant()
                        .getId();

        /*
         * IMPORTANT:
         *
         * Price is stored against ProductVariant.
         *
         * ProductVariant ID
         *        ↓
         * ProductVariantPrice
         *        ↓
         * sellingPrice
         */
        ProductVariantPriceEntity price =
                productVariantPriceRepository
                        .findByProductVariantId(
                                variantId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Price not found for product variant id: "
                                                + variantId
                                )
                        );

        if (price.getSellingPrice() == null) {

            throw new RuntimeException(
                    "Selling price not found for product variant id: "
                            + variantId
            );
        }

        if (cartItem.getQuantity() == null ||
                cartItem.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Invalid quantity for cart item: "
                            + cartItem.getId()
            );
        }

        return price
                .getSellingPrice()
                .multiply(
                        BigDecimal.valueOf(
                                cartItem.getQuantity()
                        )
                );
    }

    // =========================================================
    // CREATE ORDER ITEM
    // =========================================================

    private OrderItem createOrderItem(
            Order order,
            CartItem cartItem) {

        if (cartItem.getProductVariant() == null) {

            throw new RuntimeException(
                    "Product variant not found for cart item: "
                            + cartItem.getId()
            );
        }

        Long variantId =
                cartItem
                        .getProductVariant()
                        .getId();

        ProductVariantPriceEntity price =
                productVariantPriceRepository
                        .findByProductVariantId(
                                variantId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Price not found for product variant id: "
                                                + variantId
                                )
                        );

        if (price.getSellingPrice() == null) {

            throw new RuntimeException(
                    "Selling price not found for product variant id: "
                            + variantId
            );
        }

        if (cartItem.getProductEntity() == null) {

            throw new RuntimeException(
                    "Product not found for cart item: "
                            + cartItem.getId()
            );
        }

        if (cartItem.getQuantity() == null ||
                cartItem.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Invalid quantity for cart item: "
                            + cartItem.getId()
            );
        }

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
    }

    // =========================================================
    // GENERATE ORDER NUMBER
    // =========================================================

    private String generateOrderNumber() {

        return "NC-"
                + System.currentTimeMillis()
                + "-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 6)
                .toUpperCase();
    }

    // =========================================================
    // MAP ENTITY TO RESPONSE
    // =========================================================

    private OrderResponseDTO mapToResponse(
            Order order) {

        List<OrderItemResponseDTO> items =
                order.getItems()
                        .stream()
                        .map(item ->
                                OrderItemResponseDTO.builder()
                                        .id(item.getId())
                                        .productId(
                                                item
                                                        .getProductEntity()
                                                        .getId()
                                        )
                                        .productName(
                                                item.getProductName()
                                        )
                                        .quantity(
                                                item.getQuantity()
                                        )
                                        .price(
                                                item.getPrice()
                                        )
                                        .build()
                        )
                        .toList();

        return OrderResponseDTO.builder()
                .id(order.getId())
                .orderNumber(
                        order.getOrderNumber()
                )
                .status(
                        order.getStatus()
                )
                .paymentStatus(
                        order.getPaymentStatus()
                )
                .paymentMethod(
                        order.getPaymentMethod()
                )
                .totalAmount(
                        order.getTotalAmount()
                )
                .shippingFullName(
                        order.getShippingFullName()
                )
                .shippingStreetAddress(
                        order.getShippingStreetAddress()
                )
                .shippingCity(
                        order.getShippingCity()
                )
                .shippingPostalCode(
                        order.getShippingPostalCode()
                )
                .items(items)
                .createdAt(
                        order.getCreatedAt()
                )
                .build();
    }
}