package com.nextcart.nextcart.checkout_module;

import com.nextcart.nextcart.address_module.entity.Address;
import com.nextcart.nextcart.address_module.repository.AddressRepository;
import com.nextcart.nextcart.cart_module.Cart;
import com.nextcart.nextcart.cart_module.CartItem;
import com.nextcart.nextcart.cart_module.CartRepository;
import com.nextcart.nextcart.checkout_module.CheckoutItemResponseDTO;
import com.nextcart.nextcart.checkout_module.CheckoutRequestDTO;
import com.nextcart.nextcart.checkout_module.CheckoutResponseDTO;
import com.nextcart.nextcart.discount_module.DiscountType;
import com.nextcart.nextcart.discount_module.ProductVariantDiscountEntity;
import com.nextcart.nextcart.discount_module.ProductVariantDiscountRepository;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantStatus;
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

    /*
     * Keep delivery charge centralized.
     *
     * Later this should come from a shipping/delivery service
     * instead of being hardcoded.
     */
    private static final BigDecimal DEFAULT_DELIVERY_CHARGE = BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantPriceRepository productVariantPriceRepository;
    private final ProductVariantDiscountRepository productVariantDiscountRepository;

    // =========================================================
    // CHECKOUT PREVIEW
    // =========================================================

    @Override
    public CheckoutResponseDTO checkout(String userEmail, CheckoutRequestDTO request) {

        validateEmail(userEmail);
        validateRequest(request);

        User user = getUser(userEmail);

        /*
         * Validate shipping address belongs to current user.
         */
        Address shippingAddress = addressRepository.findByIdAndUser(request.getShippingAddressId(), user).orElseThrow(() -> new IllegalArgumentException("Shipping address not found"));

        /*
         * Billing address:
         *
         * sameAsShipping=true
         *      -> shipping address is used
         *
         * sameAsShipping=false
         *      -> billingAddressId becomes mandatory
         */
        validateBillingAddress(user, request, shippingAddress);

        /*
         * Coupon support is not implemented yet.
         *
         * Do NOT silently accept a coupon and ignore it.
         */
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {

            throw new IllegalArgumentException("Coupon processing is not available yet");
        }

        Cart cart = cartRepository.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {

            throw new IllegalArgumentException("Cannot checkout with an empty cart");
        }

        return buildCheckoutResponse(cart);
    }

    // =========================================================
    // BUILD CHECKOUT RESPONSE
    // =========================================================

    private CheckoutResponseDTO buildCheckoutResponse(Cart cart) {

        List<CheckoutItemResponseDTO> items = new ArrayList<>();

        BigDecimal productPrice = money(BigDecimal.ZERO);
        BigDecimal totalDiscount = money(BigDecimal.ZERO);
        BigDecimal orderTotal = money(BigDecimal.ZERO);

        int totalItems = 0;

        LocalDateTime now = LocalDateTime.now();

        for (CartItem cartItem : cart.getItems()) {

            validateCartItem(cartItem);

            ProductVariantEntity variant = getActiveVariant(cartItem.getProductVariant().getId());

            int quantity = cartItem.getQuantity();

            totalItems += quantity;

            Long variantId = variant.getId();

            /*
             * Get actual price from the existing
             * ProductVariantPrice module.
             */
            ProductVariantPriceEntity price = productVariantPriceRepository.findByProductVariantId(variantId).orElseThrow(() -> new IllegalArgumentException("Price not found for product variant id: " + variantId));

            BigDecimal mrp = money(price.getMrp());

            BigDecimal sellingPrice = money(price.getSellingPrice());

            if (sellingPrice.compareTo(BigDecimal.ZERO) < 0) {

                throw new IllegalArgumentException("Selling price cannot be negative");
            }

            BigDecimal quantityDecimal = BigDecimal.valueOf(quantity);

            /*
             * Discount is calculated PER UNIT,
             * exactly like your current CartServiceImpl.
             */
            BigDecimal discountPerUnit = calculateDiscount(variantId, sellingPrice, now);

            BigDecimal finalUnitPrice = sellingPrice.subtract(discountPerUnit);

            if (finalUnitPrice.compareTo(BigDecimal.ZERO) < 0) {

                finalUnitPrice = BigDecimal.ZERO;
            }

            finalUnitPrice = money(finalUnitPrice);

            BigDecimal lineTotal = money(finalUnitPrice.multiply(quantityDecimal));

            BigDecimal mrpTotal = money(mrp.multiply(quantityDecimal));

            BigDecimal lineDiscount = money(mrpTotal.subtract(lineTotal));

            if (lineDiscount.compareTo(BigDecimal.ZERO) < 0) {

                lineDiscount = BigDecimal.ZERO;
            }

            productPrice = money(productPrice.add(mrpTotal));

            totalDiscount = money(totalDiscount.add(lineDiscount));

            orderTotal = money(orderTotal.add(lineTotal));

            String productName = variant.getProductEntity() != null ? variant.getProductEntity().getName() : null;

            items.add(CheckoutItemResponseDTO.builder().cartItemId(cartItem.getId()).productId(variant.getProductEntity().getId()).productVariantId(variantId).productName(productName).quantity(quantity).unitPrice(finalUnitPrice).discount(lineDiscount).lineTotal(lineTotal).build());
        }

        /*
         * Delivery charge is currently zero.
         *
         * This should later come from shipping logic.
         */
        BigDecimal deliveryCharge = money(DEFAULT_DELIVERY_CHARGE);

        BigDecimal finalOrderTotal = money(orderTotal.add(deliveryCharge));

        return CheckoutResponseDTO.builder().cartId(cart.getId()).items(items).totalItems(totalItems).productPrice(productPrice).totalDiscount(totalDiscount).deliveryCharge(deliveryCharge).orderTotal(finalOrderTotal).currency(CURRENCY).build();
    }

    // =========================================================
    // DISCOUNT
    // =========================================================

    private BigDecimal calculateDiscount(Long productVariantId, BigDecimal sellingPrice, LocalDateTime now) {

        ProductVariantDiscountEntity discount = productVariantDiscountRepository.findCurrentDiscount(productVariantId, now).orElse(null);

        if (discount == null) {
            return money(BigDecimal.ZERO);
        }

        BigDecimal discountAmount;

        if (discount.getDiscountType() == DiscountType.PERCENTAGE) {

            discountAmount = sellingPrice.multiply(discount.getDiscountValue()).divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP);

        } else if (discount.getDiscountType() == DiscountType.FIXED_AMOUNT) {

            discountAmount = discount.getDiscountValue();

        } else {

            discountAmount = BigDecimal.ZERO;
        }

        if (discountAmount.compareTo(BigDecimal.ZERO) < 0) {

            discountAmount = BigDecimal.ZERO;
        }

        /*
         * Discount cannot exceed selling price.
         */
        return money(discountAmount.min(sellingPrice));
    }

    // =========================================================
    // ACTIVE PRODUCT VARIANT
    // =========================================================

    private ProductVariantEntity getActiveVariant(Long productVariantId) {

        return productVariantRepository.findByIdAndStatus(productVariantId, ProductVariantStatus.ACTIVE).orElseThrow(() -> new IllegalArgumentException("Active product variant not found with id: " + productVariantId));
    }

    // =========================================================
    // CART ITEM VALIDATION
    // =========================================================

    private void validateCartItem(CartItem cartItem) {

        if (cartItem == null) {

            throw new IllegalArgumentException("Cart contains an invalid item");
        }

        if (cartItem.getProductVariant() == null || cartItem.getProductVariant().getId() == null) {

            throw new IllegalArgumentException("Cart item has an invalid product variant");
        }

        if (cartItem.getQuantity() == null || cartItem.getQuantity() <= 0) {

            throw new IllegalArgumentException("Cart item quantity must be greater than zero");
        }
    }

    // =========================================================
    // ADDRESS VALIDATION
    // =========================================================

    private void validateBillingAddress(User user, CheckoutRequestDTO request, Address shippingAddress) {

        boolean sameAsShipping = Boolean.TRUE.equals(request.getSameAsShipping());

        if (sameAsShipping) {
            return;
        }

        if (request.getBillingAddressId() == null) {

            throw new IllegalArgumentException("Billing address is required when sameAsShipping is false");
        }

        addressRepository.findByIdAndUser(request.getBillingAddressId(), user).orElseThrow(() -> new IllegalArgumentException("Billing address not found"));
    }

    // =========================================================
    // USER
    // =========================================================

    private User getUser(String userEmail) {

        return userRepository.findByEmailIgnoreCase(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    private void validateRequest(CheckoutRequestDTO request) {

        if (request == null) {

            throw new IllegalArgumentException("Checkout request is required");
        }

        if (request.getShippingAddressId() == null) {

            throw new IllegalArgumentException("Shipping address is required");
        }
    }

    // =========================================================
    // EMAIL VALIDATION
    // =========================================================

    private void validateEmail(String userEmail) {

        if (userEmail == null || userEmail.isBlank()) {

            throw new IllegalArgumentException("User email is required");
        }
    }

    // =========================================================
    // MONEY
    // =========================================================

    private BigDecimal money(BigDecimal value) {

        if (value == null) {

            return BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        }

        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}