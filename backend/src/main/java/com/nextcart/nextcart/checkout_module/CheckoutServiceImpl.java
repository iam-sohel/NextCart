package com.nextcart.nextcart.checkout_module;

import com.nextcart.nextcart.address_module.entity.Address;
import com.nextcart.nextcart.address_module.repository.AddressRepository;
import com.nextcart.nextcart.cart_module.Cart;
import com.nextcart.nextcart.cart_module.CartItem;
import com.nextcart.nextcart.cart_module.CartRepository;
import com.nextcart.nextcart.customer_module.entity.Customer;
import com.nextcart.nextcart.customer_module.repository.CustomerRepository;
import com.nextcart.nextcart.discount_module.DiscountType;
import com.nextcart.nextcart.discount_module.ProductVariantDiscountEntity;
import com.nextcart.nextcart.discount_module.ProductVariantDiscountRepository;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantStatus;
import com.nextcart.nextcart.seller_module.inventory_module.service.InventoryService;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CheckoutServiceImpl implements CheckoutService {

    private static final int MONEY_SCALE = 2;

    private static final String CURRENCY = "INR";

    private static final BigDecimal DEFAULT_DELIVERY_CHARGE =
            BigDecimal.ZERO.setScale(
                    MONEY_SCALE,
                    RoundingMode.HALF_UP
            );

    private final CartRepository cartRepository;

    private final UserRepository userRepository;

    private final CustomerRepository customerRepository;

    private final AddressRepository addressRepository;

    private final ProductVariantRepository productVariantRepository;

    private final ProductVariantPriceRepository productVariantPriceRepository;

    private final ProductVariantDiscountRepository productVariantDiscountRepository;

    private final InventoryService inventoryService;


    // =========================================================
    // CHECKOUT PREVIEW
    // =========================================================

    @Override
    public CheckoutResponseDTO checkout(
            String userIdentifier,
            CheckoutRequestDTO request
    ) {

        validateUserIdentifier(userIdentifier);

        validateRequest(request);

        User user = getUser(userIdentifier);

        // -----------------------------------------------------
        // CUSTOMER
        // -----------------------------------------------------

        Customer customer = customerRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer profile not found"
                        )
                );


        // -----------------------------------------------------
        // SHIPPING ADDRESS
        // -----------------------------------------------------

        addressRepository
                .findByIdAndCustomer(
                        request.getShippingAddressId(),
                        customer
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Shipping address not found"
                        )
                );


        // -----------------------------------------------------
        // BILLING ADDRESS
        // -----------------------------------------------------

        validateBillingAddress(
                customer,
                request
        );


        // -----------------------------------------------------
        // COUPON
        // -----------------------------------------------------

        /*
         * Coupon support is not implemented yet.
         *
         * Do not silently accept and ignore it.
         */
        if (request.getCouponCode() != null
                && !request.getCouponCode().isBlank()) {

            throw new IllegalArgumentException(
                    "Coupon processing is not available yet"
            );
        }


        // -----------------------------------------------------
        // CART
        // -----------------------------------------------------

        Cart cart =
                cartRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Cart not found"
                                )
                        );


        if (cart.getItems() == null
                || cart.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Cannot checkout with an empty cart"
            );
        }


        // -----------------------------------------------------
        // BUILD CHECKOUT PREVIEW
        // -----------------------------------------------------

        return buildCheckoutResponse(cart);
    }


    // =========================================================
    // BUILD CHECKOUT RESPONSE
    // =========================================================

    private CheckoutResponseDTO buildCheckoutResponse(
            Cart cart
    ) {

        List<CheckoutItemResponseDTO> items =
                new ArrayList<>();

        BigDecimal productPrice =
                money(BigDecimal.ZERO);

        BigDecimal totalDiscount =
                money(BigDecimal.ZERO);

        BigDecimal orderTotal =
                money(BigDecimal.ZERO);

        int totalItems = 0;

        LocalDateTime now =
                LocalDateTime.now();


        for (CartItem cartItem : cart.getItems()) {

            // -------------------------------------------------
            // CART ITEM VALIDATION
            // -------------------------------------------------

            validateCartItem(cartItem);


            // -------------------------------------------------
            // ACTIVE PRODUCT VARIANT
            // -------------------------------------------------

            ProductVariantEntity variant =
                    getActiveVariant(
                            cartItem
                                    .getProductVariant()
                                    .getId()
                    );


            int quantity =
                    cartItem.getQuantity();

            totalItems += quantity;

            Long variantId =
                    variant.getId();


            // -------------------------------------------------
            // INVENTORY AVAILABILITY
            // -------------------------------------------------

            /*
             * Checkout Preview only checks stock.
             *
             * It does NOT reserve stock.
             *
             * Actual order creation must perform the
             * authoritative check + reservation.
             */

            Integer availableStock =
                    inventoryService.getTotalAvailableStock(variantId);

            if (availableStock == null) {
                throw new IllegalArgumentException(
                        "Inventory not found for product variant id: "
                                + variantId
                );
            }

            if (availableStock < 0) {
                throw new IllegalArgumentException(
                        "Invalid inventory stock for product variant: "
                                + variantId
                );
            }

            if (availableStock < quantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product variant: "
                                + variantId
                                + ". Available: "
                                + availableStock
                                + ", Requested: "
                                + quantity
                );
            }


            // -------------------------------------------------
            // PRICE
            // -------------------------------------------------

            ProductVariantPriceEntity price =
                    productVariantPriceRepository
                            .findByProductVariantId(variantId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Price not found for product variant id: "
                                                    + variantId
                                    )
                            );


            BigDecimal mrp =
                    money(price.getMrp());


            BigDecimal sellingPrice =
                    money(price.getSellingPrice());


            if (sellingPrice.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                throw new IllegalArgumentException(
                        "Selling price cannot be negative"
                );
            }


            BigDecimal quantityDecimal =
                    BigDecimal.valueOf(quantity);


            // -------------------------------------------------
            // DISCOUNT
            // -------------------------------------------------

            BigDecimal discountPerUnit =
                    calculateDiscount(
                            variantId,
                            sellingPrice,
                            now
                    );


            BigDecimal finalUnitPrice =
                    sellingPrice.subtract(
                            discountPerUnit
                    );


            if (finalUnitPrice.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                finalUnitPrice =
                        BigDecimal.ZERO;
            }


            finalUnitPrice =
                    money(finalUnitPrice);


            // -------------------------------------------------
            // TOTALS
            // -------------------------------------------------

            BigDecimal lineTotal =
                    money(
                            finalUnitPrice.multiply(
                                    quantityDecimal
                            )
                    );


            BigDecimal mrpTotal =
                    money(
                            mrp.multiply(
                                    quantityDecimal
                            )
                    );


            BigDecimal lineDiscount =
                    money(
                            mrpTotal.subtract(
                                    lineTotal
                            )
                    );


            if (lineDiscount.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                lineDiscount =
                        BigDecimal.ZERO;
            }


            productPrice =
                    money(
                            productPrice.add(
                                    mrpTotal
                            )
                    );


            totalDiscount =
                    money(
                            totalDiscount.add(
                                    lineDiscount
                            )
                    );


            orderTotal =
                    money(
                            orderTotal.add(
                                    lineTotal
                            )
                    );


            String productName =
                    variant.getProductEntity() != null
                            ? variant
                            .getProductEntity()
                            .getName()
                            : null;


            // -------------------------------------------------
            // ITEM RESPONSE
            // -------------------------------------------------

            items.add(
                    CheckoutItemResponseDTO
                            .builder()
                            .cartItemId(
                                    cartItem.getId()
                            )
                            .productId(
                                    variant
                                            .getProductEntity()
                                            .getId()
                            )
                            .productVariantId(
                                    variantId
                            )
                            .productName(
                                    productName
                            )
                            .quantity(
                                    quantity
                            )
                            .unitPrice(
                                    finalUnitPrice
                            )
                            .discount(
                                    lineDiscount
                            )
                            .lineTotal(
                                    lineTotal
                            )
                            .build()
            );
        }


        // -----------------------------------------------------
        // DELIVERY
        // -----------------------------------------------------

        BigDecimal deliveryCharge =
                money(
                        DEFAULT_DELIVERY_CHARGE
                );


        BigDecimal finalOrderTotal =
                money(
                        orderTotal.add(
                                deliveryCharge
                        )
                );


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return CheckoutResponseDTO
                .builder()
                .cartId(
                        cart.getId()
                )
                .items(
                        items
                )
                .totalItems(
                        totalItems
                )
                .productPrice(
                        productPrice
                )
                .totalDiscount(
                        totalDiscount
                )
                .deliveryCharge(
                        deliveryCharge
                )
                .orderTotal(
                        finalOrderTotal
                )
                .currency(
                        CURRENCY
                )
                .build();
    }


    // =========================================================
    // DISCOUNT
    // =========================================================

    private BigDecimal calculateDiscount(
            Long productVariantId,
            BigDecimal sellingPrice,
            LocalDateTime now
    ) {

        ProductVariantDiscountEntity discount =
                productVariantDiscountRepository
                        .findCurrentDiscount(
                                productVariantId,
                                now
                        )
                        .orElse(null);


        if (discount == null) {

            return money(
                    BigDecimal.ZERO
            );
        }


        BigDecimal discountAmount;


        if (discount.getDiscountType()
                == DiscountType.PERCENTAGE) {

            discountAmount =
                    sellingPrice
                            .multiply(
                                    discount
                                            .getDiscountValue()
                            )
                            .divide(
                                    BigDecimal.valueOf(100),
                                    MONEY_SCALE,
                                    RoundingMode.HALF_UP
                            );

        } else if (discount.getDiscountType()
                == DiscountType.FIXED_AMOUNT) {

            discountAmount =
                    discount.getDiscountValue();

        } else {

            discountAmount =
                    BigDecimal.ZERO;
        }


        if (discountAmount.compareTo(
                BigDecimal.ZERO
        ) < 0) {

            discountAmount =
                    BigDecimal.ZERO;
        }


        /*
         * Discount cannot exceed selling price.
         */

        return money(
                discountAmount.min(
                        sellingPrice
                )
        );
    }


    // =========================================================
    // ACTIVE PRODUCT VARIANT
    // =========================================================

    private ProductVariantEntity getActiveVariant(
            Long productVariantId
    ) {

        if (productVariantId == null
                || productVariantId <= 0) {

            throw new IllegalArgumentException(
                    "Invalid product variant id"
            );
        }


        return productVariantRepository
                .findByIdAndStatus(
                        productVariantId,
                        ProductVariantStatus.ACTIVE
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Active product variant not found with id: "
                                        + productVariantId
                        )
                );
    }


    // =========================================================
    // CART ITEM VALIDATION
    // =========================================================

    private void validateCartItem(
            CartItem cartItem
    ) {

        if (cartItem == null) {

            throw new IllegalArgumentException(
                    "Cart contains an invalid item"
            );
        }


        if (cartItem.getProductVariant() == null
                || cartItem
                .getProductVariant()
                .getId() == null) {

            throw new IllegalArgumentException(
                    "Cart item has an invalid product variant"
            );
        }


        if (cartItem.getQuantity() == null
                || cartItem.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Cart item quantity must be greater than zero"
            );
        }
    }


    // =========================================================
    // ADDRESS VALIDATION
    // =========================================================

    private void validateBillingAddress(
            Customer customer,
            CheckoutRequestDTO request
    ) {

        boolean sameAsShipping =
                Boolean.TRUE.equals(
                        request.getSameAsShipping()
                );


        if (sameAsShipping) {

            return;
        }


        if (request.getBillingAddressId() == null
                || request.getBillingAddressId() <= 0) {

            throw new IllegalArgumentException(
                    "Billing address is required when sameAsShipping is false"
            );
        }


        addressRepository
                .findByIdAndCustomer(
                        request.getBillingAddressId(),
                        customer
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Billing address not found"
                        )
                );
    }


    // =========================================================
    // USER
    // =========================================================

    private User getUser(
            String userIdentifier
    ) {

        if (userIdentifier == null
                || userIdentifier.isBlank()) {

            throw new IllegalArgumentException(
                    "Authenticated user is required"
            );
        }


        String identifier =
                userIdentifier.trim();


        /*
         * First treat identifier as USER ID.
         *
         * Example:
         * "1" -> findById(1)
         */

        try {

            Long userId =
                    Long.valueOf(identifier);


            return userRepository
                    .findById(userId)
                    .orElseThrow(
                            () -> new IllegalArgumentException(
                                    "User not found with id: "
                                            + userId
                            )
                    );

        } catch (NumberFormatException ignored) {

            /*
             * Backward compatibility:
             *
             * If identifier is not numeric,
             * treat it as email.
             */

            return userRepository
                    .findByEmailIgnoreCase(
                            identifier
                    )
                    .orElseThrow(
                            () -> new IllegalArgumentException(
                                    "User not found"
                            )
                    );
        }
    }


    // =========================================================
    // USER IDENTIFIER VALIDATION
    // =========================================================

    private void validateUserIdentifier(
            String userIdentifier
    ) {

        if (userIdentifier == null
                || userIdentifier.isBlank()) {

            throw new IllegalArgumentException(
                    "Authenticated user is required"
            );
        }
    }


    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    private void validateRequest(
            CheckoutRequestDTO request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Checkout request is required"
            );
        }


        if (request.getShippingAddressId() == null
                || request.getShippingAddressId() <= 0) {

            throw new IllegalArgumentException(
                    "Shipping address is required"
            );
        }


        boolean sameAsShipping =
                Boolean.TRUE.equals(
                        request.getSameAsShipping()
                );


        if (!sameAsShipping) {

            if (request.getBillingAddressId() == null
                    || request.getBillingAddressId() <= 0) {

                throw new IllegalArgumentException(
                        "Billing address is required when sameAsShipping is false"
                );
            }
        }
    }


    // =========================================================
    // MONEY
    // =========================================================

    private BigDecimal money(
            BigDecimal value
    ) {

        if (value == null) {

            return BigDecimal.ZERO.setScale(
                    MONEY_SCALE,
                    RoundingMode.HALF_UP
            );
        }


        return value.setScale(
                MONEY_SCALE,
                RoundingMode.HALF_UP
        );
    }
}
