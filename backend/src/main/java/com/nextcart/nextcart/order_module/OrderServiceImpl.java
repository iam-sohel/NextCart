package com.nextcart.nextcart.order_module;

import com.nextcart.nextcart.address_module.entity.Address;
import com.nextcart.nextcart.address_module.repository.AddressRepository;
import com.nextcart.nextcart.cart_module.Cart;
import com.nextcart.nextcart.cart_module.CartItem;
import com.nextcart.nextcart.cart_module.CartRepository;
import com.nextcart.nextcart.discount_module.DiscountType;
import com.nextcart.nextcart.discount_module.ProductVariantDiscountEntity;
import com.nextcart.nextcart.discount_module.ProductVariantDiscountRepository;
import com.nextcart.nextcart.inventory_module.InventoryService;
import com.nextcart.nextcart.order_module.dto.OrderCreateRequestDTO;
import com.nextcart.nextcart.order_module.dto.OrderItemResponseDTO;
import com.nextcart.nextcart.order_module.dto.OrderResponseDTO;
import com.nextcart.nextcart.order_module.exceptions.InvalidOrderStatusException;
import com.nextcart.nextcart.order_module.exceptions.OrderCancellationException;
import com.nextcart.nextcart.order_module.exceptions.OrderNotFoundException;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantStatus;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private static final int MONEY_SCALE = 2;

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);

    private static final BigDecimal SHIPPING_CHARGE = ZERO;

    private static final BigDecimal TAX_AMOUNT = ZERO;

    private final OrderRepository orderRepository;

    private final CartRepository cartRepository;

    private final AddressRepository addressRepository;

    private final UserRepository userRepository;

    private final InventoryService inventoryService;

    private final ProductVariantRepository productVariantRepository;

    private final ProductVariantPriceRepository productVariantPriceRepository;

    private final ProductVariantDiscountRepository productVariantDiscountRepository;


    // =========================================================
    // CREATE ORDER
    // =========================================================

    @Override
    @Transactional
    public OrderResponseDTO createOrder(String userEmail, OrderCreateRequestDTO request) {

        validateEmail(userEmail);

        if (request == null || request.getAddressId() == null) {

            throw new IllegalArgumentException("Address ID is required");
        }

        validateId(request.getAddressId());

        User user = getUser(userEmail);

        /*
         * Address belongs to the authenticated user.
         */
        Address address = addressRepository.findByIdAndUser(request.getAddressId(), user).orElseThrow(() -> new OrderNotFoundException("Shipping address not found"));

        /*
         * Get the user's cart.
         */
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> new OrderNotFoundException("Cart not found"));

        validateCart(cart);

        /*
         * Calculate the complete order price BEFORE
         * changing inventory.
         *
         * This is important.
         *
         * If pricing is invalid, no stock is reserved.
         */
        PricingResult pricing = calculatePricing(cart);

        /*
         * Reserve inventory only after all cart items
         * and pricing have been validated.
         *
         * InventoryService is responsible for the
         * pessimistic stock locking.
         */
        reserveInventory(cart);

        /*
         * Create order as PENDING.
         *
         * Payment will later move:
         *
         * PENDING -> CONFIRMED
         *
         * Do NOT mark it CONFIRMED here because online
         * payment has not succeeded yet.
         */
        OrderEntity order = OrderEntity.builder().orderNumber(generateOrderNumber()).user(user).status(OrderStatus.PENDING)

                // =====================================
                // ADDRESS SNAPSHOT
                // =====================================

                .shippingFullName(address.getFullName()).shippingPhoneNumber(address.getPhoneNumber()).shippingStreetAddress(address.getStreetAddress()).shippingLandmark(address.getLandmark()).shippingCity(address.getCity()).shippingState(address.getState()).shippingPostalCode(address.getPostalCode()).shippingCountry(address.getCountry())

                // =====================================
                // ORDER PRICING
                // =====================================

                .subtotal(pricing.subtotal()).discountAmount(pricing.discountAmount()).shippingCharge(SHIPPING_CHARGE).taxAmount(TAX_AMOUNT).totalAmount(pricing.totalAmount()).currency(pricing.currency())

                .items(new ArrayList<>()).build();

        /*
         * Create immutable order-item snapshots.
         */
        for (PricedCartItem pricedItem : pricing.items()) {

            CartItem cartItem = pricedItem.cartItem();

            ProductVariantEntity variant = pricedItem.variant();

            OrderItemEntity orderItem = OrderItemEntity.builder().productVariant(variant).productName(getProductName(cartItem)).sku(variant.getSku()).quantity(cartItem.getQuantity()).unitMrp(pricedItem.unitMrp()).unitSellingPrice(pricedItem.unitSellingPrice()).discountAmount(pricedItem.discountAmount()).lineTotal(pricedItem.lineTotal()).build();

            order.addItem(orderItem);
        }

        /*
         * Save the complete order.
         */
        OrderEntity savedOrder = orderRepository.save(order);

        /*
         * Clear cart only after order creation succeeds.
         */
        cart.clearItems();

        return mapToResponse(savedOrder);
    }


    // =========================================================
    // CUSTOMER - GET ORDER BY ID
    // =========================================================

    @Override
    public OrderResponseDTO getOrderById(String userEmail, Long orderId) {

        validateEmail(userEmail);
        validateId(orderId);

        User user = getUser(userEmail);

        OrderEntity order = orderRepository.findByIdAndUser(orderId, user).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        return mapToResponse(order);
    }


    // =========================================================
    // CUSTOMER - GET ORDER BY NUMBER
    // =========================================================

    @Override
    public OrderResponseDTO getOrderByNumber(String userEmail, String orderNumber) {

        validateEmail(userEmail);

        if (orderNumber == null || orderNumber.isBlank()) {

            throw new IllegalArgumentException("Order number is required");
        }

        User user = getUser(userEmail);

        OrderEntity order = orderRepository.findByOrderNumber(orderNumber).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        /*
         * Prevent access to another user's order.
         */
        if (order.getUser() == null || order.getUser().getId() == null || !order.getUser().getId().equals(user.getId())) {

            throw new OrderNotFoundException("Order not found");
        }

        return mapToResponse(order);
    }


    // =========================================================
    // CUSTOMER - MY ORDERS
    // =========================================================

    @Override
    public Page<OrderResponseDTO> getMyOrders(String userEmail, Pageable pageable) {

        validateEmail(userEmail);

        User user = getUser(userEmail);

        return orderRepository.findByUser(user, pageable).map(this::mapToResponse);
    }


    // =========================================================
    // CUSTOMER - MY ORDERS BY STATUS
    // =========================================================

    @Override
    public Page<OrderResponseDTO> getMyOrdersByStatus(String userEmail, OrderStatus status, Pageable pageable) {

        validateEmail(userEmail);

        if (status == null) {

            throw new InvalidOrderStatusException("Order status is required");
        }

        User user = getUser(userEmail);

        return orderRepository.findByUserAndStatus(user, status, pageable).map(this::mapToResponse);
    }


    // =========================================================
    // CUSTOMER - CANCEL ORDER
    // =========================================================

    @Override
    @Transactional
    public OrderResponseDTO cancelOrder(String userEmail, Long orderId) {

        validateEmail(userEmail);
        validateId(orderId);

        User user = getUser(userEmail);

        /*
         * Lock order row.
         */
        OrderEntity order = orderRepository.findByIdForUpdate(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        /*
         * Prevent another user from cancelling
         * this order.
         */
        if (order.getUser() == null || order.getUser().getId() == null || !order.getUser().getId().equals(user.getId())) {

            throw new OrderNotFoundException("Order not found");
        }

        if (!isCancellable(order.getStatus())) {

            throw new OrderCancellationException("Order cannot be cancelled in status: " + order.getStatus());
        }

        /*
         * Release reserved inventory.
         */
        releaseReservedInventory(order);

        order.setStatus(OrderStatus.CANCELLED);

        return mapToResponse(orderRepository.save(order));
    }


    // =========================================================
    // ADMIN - GET ORDER
    // =========================================================

    @Override
    public OrderResponseDTO getOrderByIdForAdmin(Long orderId) {

        validateId(orderId);

        OrderEntity order = orderRepository.findById(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        return mapToResponse(order);
    }


    // =========================================================
    // ADMIN - GET ALL ORDERS
    // =========================================================

    @Override
    public Page<OrderResponseDTO> getAllOrdersForAdmin(Pageable pageable) {

        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }


    // =========================================================
    // ADMIN - GET ORDERS BY STATUS
    // =========================================================

    @Override
    public Page<OrderResponseDTO> getOrdersByStatusForAdmin(OrderStatus status, Pageable pageable) {

        if (status == null) {

            throw new InvalidOrderStatusException("Order status is required");
        }

        return orderRepository.findByStatus(status, pageable).map(this::mapToResponse);
    }


    // =========================================================
    // ADMIN - UPDATE STATUS
    // =========================================================

    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {

        validateId(orderId);

        if (newStatus == null) {

            throw new InvalidOrderStatusException("Order status is required");
        }

        /*
         * Lock order to prevent concurrent state changes.
         */
        OrderEntity order = orderRepository.findByIdForUpdate(orderId).orElseThrow(() -> new OrderNotFoundException("Order not found"));

        OrderStatus currentStatus = order.getStatus();

        validateStatusTransition(currentStatus, newStatus);

        /*
         * CANCELLED:
         *
         * Reserved stock is returned to available stock.
         */
        if (newStatus == OrderStatus.CANCELLED) {

            releaseReservedInventory(order);
        }

        /*
         * DELIVERED:
         *
         * Reserved stock becomes sold stock.
         */
        if (newStatus == OrderStatus.DELIVERED) {

            deductReservedInventory(order);
        }

        /*
         * RETURNED:
         *
         * Returned items become available again.
         */
        if (newStatus == OrderStatus.RETURNED) {

            restoreReturnedInventory(order);
        }

        order.setStatus(newStatus);

        return mapToResponse(orderRepository.save(order));
    }


    // =========================================================
    // PRICING
    // =========================================================

    private PricingResult calculatePricing(Cart cart) {

        List<PricedCartItem> pricedItems = new ArrayList<>();

        BigDecimal subtotal = ZERO;
        BigDecimal totalDiscount = ZERO;

        String currency = null;

        LocalDateTime now = LocalDateTime.now();

        for (CartItem cartItem : cart.getItems()) {

            ProductVariantEntity variant = getActiveProductVariant(cartItem.getProductVariant().getId());

            Long variantId = variant.getId();

            ProductVariantPriceEntity price = productVariantPriceRepository.findByProductVariantId(variantId).orElseThrow(() -> new IllegalArgumentException("Price not found for product variant: " + variantId));

            validatePrice(price);

            /*
             * Make sure all order items use the same
             * currency.
             */
            if (currency == null) {

                currency = price.getCurrency();

            } else if (!currency.equalsIgnoreCase(price.getCurrency())) {

                throw new IllegalArgumentException("Multiple currencies are not supported in one order");
            }

            BigDecimal mrp = money(price.getMrp());

            BigDecimal sellingPrice = money(price.getSellingPrice());

            int quantity = cartItem.getQuantity();

            BigDecimal quantityDecimal = BigDecimal.valueOf(quantity);

            /*
             * Subtotal is the selling price before
             * promotional discount.
             */
            BigDecimal lineSubtotal = money(sellingPrice.multiply(quantityDecimal));

            BigDecimal discountPerUnit = calculateDiscount(variantId, sellingPrice, now);

            BigDecimal lineDiscount = money(discountPerUnit.multiply(quantityDecimal));

            BigDecimal lineTotal = money(lineSubtotal.subtract(lineDiscount));

            if (lineTotal.compareTo(ZERO) < 0) {

                throw new IllegalArgumentException("Calculated line total cannot be negative");
            }

            subtotal = money(subtotal.add(lineSubtotal));

            totalDiscount = money(totalDiscount.add(lineDiscount));

            pricedItems.add(new PricedCartItem(cartItem, variant, mrp, sellingPrice, lineDiscount, lineTotal));
        }

        if (currency == null || currency.isBlank()) {

            throw new IllegalArgumentException("Order currency is missing");
        }

        BigDecimal totalAmount = money(subtotal.subtract(totalDiscount).add(SHIPPING_CHARGE).add(TAX_AMOUNT));

        if (totalAmount.compareTo(ZERO) <= 0) {

            throw new IllegalArgumentException("Order total must be greater than zero");
        }

        return new PricingResult(pricedItems, subtotal, totalDiscount, totalAmount, currency.toUpperCase());
    }


    // =========================================================
    // DISCOUNT
    // =========================================================

    private BigDecimal calculateDiscount(Long productVariantId, BigDecimal sellingPrice, LocalDateTime now) {

        ProductVariantDiscountEntity discount = productVariantDiscountRepository.findCurrentDiscount(productVariantId, now).orElse(null);

        if (discount == null) {
            return ZERO;
        }

        BigDecimal discountAmount;

        if (discount.getDiscountType() == DiscountType.PERCENTAGE) {

            discountAmount = sellingPrice.multiply(discount.getDiscountValue()).divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP);

        } else if (discount.getDiscountType() == DiscountType.FIXED_AMOUNT) {

            discountAmount = discount.getDiscountValue();

        } else {

            throw new IllegalArgumentException("Unsupported discount type");
        }

        discountAmount = money(discountAmount);

        /*
         * Discount cannot be greater than selling price.
         */
        if (discountAmount.compareTo(sellingPrice) > 0) {

            discountAmount = sellingPrice;
        }

        if (discountAmount.compareTo(ZERO) < 0) {

            throw new IllegalArgumentException("Discount cannot be negative");
        }

        return discountAmount;
    }


    // =========================================================
    // PRICE VALIDATION
    // =========================================================

    private void validatePrice(ProductVariantPriceEntity price) {

        if (price.getMrp() == null || price.getSellingPrice() == null) {

            throw new IllegalArgumentException("Product price is incomplete");
        }

        if (price.getMrp().compareTo(ZERO) < 0) {

            throw new IllegalArgumentException("MRP cannot be negative");
        }

        if (price.getSellingPrice().compareTo(ZERO) < 0) {

            throw new IllegalArgumentException("Selling price cannot be negative");
        }

        if (price.getSellingPrice().compareTo(price.getMrp()) > 0) {

            throw new IllegalArgumentException("Selling price cannot be greater than MRP");
        }

        if (price.getCurrency() == null || price.getCurrency().isBlank()) {

            throw new IllegalArgumentException("Product currency is required");
        }
    }


    // =========================================================
    // INVENTORY - RESERVE
    // =========================================================

    private void reserveInventory(Cart cart) {

        for (CartItem cartItem : cart.getItems()) {

            ProductVariantEntity variant = cartItem.getProductVariant();

            if (variant == null || variant.getId() == null) {

                throw new IllegalArgumentException("Cart contains invalid product variant");
            }

            inventoryService.reserveStock(variant.getId(), cartItem.getQuantity());
        }
    }


    // =========================================================
    // INVENTORY - RELEASE
    // =========================================================

    private void releaseReservedInventory(OrderEntity order) {

        if (order.getItems() == null || order.getItems().isEmpty()) {

            return;
        }

        for (OrderItemEntity item : order.getItems()) {

            validateOrderItemForInventory(item);

            inventoryService.releaseStock(item.getProductVariant().getId(), item.getQuantity());
        }
    }


    // =========================================================
    // INVENTORY - DEDUCT RESERVED
    // =========================================================

    private void deductReservedInventory(OrderEntity order) {

        if (order.getItems() == null || order.getItems().isEmpty()) {

            return;
        }

        for (OrderItemEntity item : order.getItems()) {

            validateOrderItemForInventory(item);

            inventoryService.deductStock(item.getProductVariant().getId(), item.getQuantity());
        }
    }


    // =========================================================
    // INVENTORY - RESTORE RETURN
    // =========================================================

    private void restoreReturnedInventory(OrderEntity order) {

        if (order.getItems() == null || order.getItems().isEmpty()) {

            return;
        }

        for (OrderItemEntity item : order.getItems()) {

            validateOrderItemForInventory(item);

            inventoryService.addStock(item.getProductVariant().getId(), item.getQuantity());
        }
    }


    // =========================================================
    // INVENTORY ITEM VALIDATION
    // =========================================================

    private void validateOrderItemForInventory(OrderItemEntity item) {

        if (item == null) {

            throw new IllegalStateException("Order contains an invalid item");
        }

        if (item.getProductVariant() == null || item.getProductVariant().getId() == null) {

            throw new IllegalStateException("Order contains invalid product variant");
        }

        if (item.getQuantity() == null || item.getQuantity() <= 0) {

            throw new IllegalStateException("Order contains invalid quantity");
        }
    }


    // =========================================================
    // ACTIVE PRODUCT VARIANT
    // =========================================================

    private ProductVariantEntity getActiveProductVariant(Long productVariantId) {

        validateId(productVariantId);

        return productVariantRepository.findByIdAndStatus(productVariantId, ProductVariantStatus.ACTIVE).orElseThrow(() -> new IllegalArgumentException("Active product variant not found: " + productVariantId));
    }


    // =========================================================
    // CART VALIDATION
    // =========================================================

    private void validateCart(Cart cart) {

        if (cart == null) {

            throw new IllegalArgumentException("Cart is required");
        }

        if (cart.getItems() == null || cart.getItems().isEmpty()) {

            throw new IllegalArgumentException("Cannot create order from an empty cart");
        }

        for (CartItem item : cart.getItems()) {

            if (item == null) {

                throw new IllegalArgumentException("Cart contains an invalid item");
            }

            if (item.getProductVariant() == null || item.getProductVariant().getId() == null) {

                throw new IllegalArgumentException("Cart contains an invalid product variant");
            }

            if (item.getQuantity() == null || item.getQuantity() <= 0) {

                throw new IllegalArgumentException("Cart contains an invalid quantity");
            }

            if (item.getProduct() == null) {

                throw new IllegalArgumentException("Cart item has no product");
            }
        }
    }


    // =========================================================
    // STATUS TRANSITIONS
    // =========================================================

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {

        if (current == null) {

            throw new InvalidOrderStatusException("Current order status is missing");
        }

        if (next == null) {

            throw new InvalidOrderStatusException("New order status is required");
        }

        if (current == next) {

            throw new InvalidOrderStatusException("Order is already in status: " + current);
        }

        /*
         * Terminal states.
         */
        if (current == OrderStatus.CANCELLED || current == OrderStatus.REFUNDED || current == OrderStatus.RETURNED) {

            throw new InvalidOrderStatusException("Order cannot transition from: " + current);
        }

        boolean valid;

        switch (current) {

            case PENDING:

                valid = next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;

                break;

            case CONFIRMED:

                valid = next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED;

                break;

            case PROCESSING:

                valid = next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;

                break;

            case SHIPPED:

                valid = next == OrderStatus.DELIVERED;

                break;

            case DELIVERED:

                valid = next == OrderStatus.RETURN_REQUESTED;

                break;

            case RETURN_REQUESTED:

                valid = next == OrderStatus.RETURN_APPROVED;

                break;

            case RETURN_APPROVED:

                valid = next == OrderStatus.RETURNED;

                break;

            default:

                valid = false;
        }

        if (!valid) {

            throw new InvalidOrderStatusException("Invalid order status transition: " + current + " -> " + next);
        }
    }


    // =========================================================
    // CANCELLATION RULE
    // =========================================================

    private boolean isCancellable(OrderStatus status) {

        return status == OrderStatus.PENDING || status == OrderStatus.CONFIRMED || status == OrderStatus.PROCESSING;
    }


    // =========================================================
    // USER
    // =========================================================

    private User getUser(String email) {

        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }


    // =========================================================
    // EMAIL VALIDATION
    // =========================================================

    private void validateEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException("User email is required");
        }
    }


    // =========================================================
    // ID VALIDATION
    // =========================================================

    private void validateId(Long id) {

        if (id == null || id <= 0) {

            throw new IllegalArgumentException("Invalid ID");
        }
    }


    // =========================================================
    // ORDER NUMBER
    // =========================================================

    private String generateOrderNumber() {

        return "NC-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }


    // =========================================================
    // PRODUCT NAME
    // =========================================================

    private String getProductName(CartItem cartItem) {

        if (cartItem.getProduct() == null) {

            throw new IllegalArgumentException("Cart item has no product");
        }

        return cartItem.getProduct().getName();
    }


    // =========================================================
    // MONEY
    // =========================================================

    private BigDecimal money(BigDecimal value) {

        if (value == null) {
            return ZERO;
        }

        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }


    // =========================================================
    // RESPONSE
    // =========================================================

    private OrderResponseDTO mapToResponse(OrderEntity order) {

        List<OrderItemResponseDTO> itemResponses = new ArrayList<>();

        if (order.getItems() != null) {

            for (OrderItemEntity item : order.getItems()) {

                itemResponses.add(mapItemToResponse(item));
            }
        }

        return OrderResponseDTO.builder().id(order.getId()).orderNumber(order.getOrderNumber()).status(order.getStatus())

                .shippingFullName(order.getShippingFullName()).shippingPhoneNumber(order.getShippingPhoneNumber()).shippingStreetAddress(order.getShippingStreetAddress()).shippingLandmark(order.getShippingLandmark()).shippingCity(order.getShippingCity()).shippingState(order.getShippingState()).shippingPostalCode(order.getShippingPostalCode()).shippingCountry(order.getShippingCountry())

                .subtotal(order.getSubtotal()).discountAmount(order.getDiscountAmount()).shippingCharge(order.getShippingCharge()).taxAmount(order.getTaxAmount()).totalAmount(order.getTotalAmount()).currency(order.getCurrency())

                .items(itemResponses)

                .createdAt(order.getCreatedAt()).updatedAt(order.getUpdatedAt())

                .build();
    }


    // =========================================================
    // ORDER ITEM RESPONSE
    // =========================================================

    private OrderItemResponseDTO mapItemToResponse(OrderItemEntity item) {

        return OrderItemResponseDTO.builder().id(item.getId()).productVariantId(item.getProductVariant().getId()).productName(item.getProductName()).sku(item.getSku()).quantity(item.getQuantity()).unitMrp(item.getUnitMrp()).unitSellingPrice(item.getUnitSellingPrice()).discountAmount(item.getDiscountAmount()).lineTotal(item.getLineTotal()).build();
    }


    // =========================================================
    // PRICING RESULT
    // =========================================================

    private record PricingResult(List<PricedCartItem> items, BigDecimal subtotal, BigDecimal discountAmount,
                                 BigDecimal totalAmount, String currency) {
    }


    // =========================================================
    // PRICED CART ITEM
    // =========================================================

    private record PricedCartItem(CartItem cartItem, ProductVariantEntity variant, BigDecimal unitMrp,
                                  BigDecimal unitSellingPrice, BigDecimal discountAmount, BigDecimal lineTotal) {
    }
}