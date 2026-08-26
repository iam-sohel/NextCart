package com.nextcart.nextcart.cart_module;

import com.nextcart.nextcart.cart_module.dto.CartItemAddRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemResponseDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemUpdateRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.cart_module.exceptions.CartItemNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.InvalidCartQuantityException;
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
@Transactional
public class CartServiceImpl implements CartService {

    private static final int MONEY_SCALE = 2;

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    private final ProductVariantRepository productVariantRepository;

    private final ProductVariantPriceRepository
            productVariantPriceRepository;

    private final ProductVariantDiscountRepository
            productVariantDiscountRepository;

    // =========================================================
    // GET CART
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(String userEmail) {

        User user = getUser(userEmail);

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseGet(() -> new Cart(user));

        return buildCartResponse(cart);
    }

    // =========================================================
    // ADD ITEM
    // =========================================================

    @Override
    public CartResponseDTO addItem(
            String userEmail,
            CartItemAddRequestDTO request) {

        validateQuantity(request.getQuantity());

        User user = getUser(userEmail);

        ProductVariantEntity productVariant =
                getActiveProductVariant(
                        request.getProductVariantId()
                );

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElseGet(() ->
                        cartRepository.save(
                                new Cart(user)
                        )
                );

        CartItem existingItem =
                cartItemRepository
                        .findByCartIdAndProductVariantId(
                                cart.getId(),
                                productVariant.getId()
                        )
                        .orElse(null);

        if (existingItem != null) {

            int newQuantity =
                    existingItem.getQuantity()
                            + request.getQuantity();

            validateQuantity(newQuantity);

            existingItem.setQuantity(newQuantity);

            cartItemRepository.save(existingItem);

        } else {

            CartItem cartItem =
                    CartItem.builder()
                            .cart(cart)
                            .product(
                                    productVariant.getProductEntity()
                            )
                            .productVariant(productVariant)
                            .quantity(request.getQuantity())
                            .build();

            cart.addItem(cartItem);

            cartItemRepository.save(cartItem);
        }

        return buildCartResponse(cart);
    }

    // =========================================================
    // UPDATE ITEM
    // =========================================================

    @Override
    public CartResponseDTO updateItem(
            String userEmail,
            Long itemId,
            CartItemUpdateRequestDTO request) {

        validateQuantity(request.getQuantity());

        User user = getUser(userEmail);

        Cart cart = getCart(user);

        CartItem cartItem =
                cartItemRepository
                        .findByIdAndCartId(
                                itemId,
                                cart.getId()
                        )
                        .orElseThrow(() ->
                                new CartItemNotFoundException(
                                        "Cart item not found with id: "
                                                + itemId
                                )
                        );

        ProductVariantEntity productVariant =
                getActiveProductVariant(
                        cartItem
                                .getProductVariant()
                                .getId()
                );

        cartItem.setProduct(
                productVariant.getProductEntity()
        );

        cartItem.setProductVariant(productVariant);

        cartItem.setQuantity(
                request.getQuantity()
        );

        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }

    // =========================================================
    // REMOVE ITEM
    // =========================================================

    @Override
    public void removeItem(
            String userEmail,
            Long itemId) {

        User user = getUser(userEmail);

        Cart cart = getCart(user);

        CartItem cartItem =
                cartItemRepository
                        .findByIdAndCartId(
                                itemId,
                                cart.getId()
                        )
                        .orElseThrow(() ->
                                new CartItemNotFoundException(
                                        "Cart item not found with id: "
                                                + itemId
                                )
                        );

        cart.removeItem(cartItem);

        cartItemRepository.delete(cartItem);
    }

    // =========================================================
    // CLEAR CART
    // =========================================================

    @Override
    public void clearCart(String userEmail) {

        User user = getUser(userEmail);

        Cart cart = getCart(user);

        cart.clearItems();

        cartRepository.save(cart);
    }

    // =========================================================
    // USER
    // =========================================================

    private User getUser(String userEmail) {

        return userRepository
                .findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    // =========================================================
    // CART
    // =========================================================

    private Cart getCart(User user) {

        return cartRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new CartNotFoundException(
                                "Cart not found for user"
                        )
                );
    }

    // =========================================================
    // PRODUCT VARIANT
    // =========================================================

    private ProductVariantEntity getActiveProductVariant(
            Long productVariantId) {

        return productVariantRepository
                .findByIdAndStatus(
                        productVariantId,
                        ProductVariantStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new CartItemNotFoundException(
                                "Active product variant not found with id: "
                                        + productVariantId
                        )
                );
    }

    // =========================================================
    // QUANTITY VALIDATION
    // =========================================================

    private void validateQuantity(Integer quantity) {

        if (quantity == null || quantity < 1) {

            throw new InvalidCartQuantityException(
                    "Cart quantity must be at least 1"
            );
        }
    }

    // =========================================================
    // CART RESPONSE
    // =========================================================

    private CartResponseDTO buildCartResponse(
            Cart cart) {

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            return CartResponseDTO.builder()
                    .id(cart.getId())
                    .items(List.of())
                    .totalItems(0)
                    .productPrice(BigDecimal.ZERO)
                    .totalDiscount(BigDecimal.ZERO)
                    .orderTotal(BigDecimal.ZERO)
                    .build();
        }

        List<CartItemResponseDTO> responseItems =
                new ArrayList<>();

        BigDecimal productPrice =
                BigDecimal.ZERO;

        BigDecimal totalDiscount =
                BigDecimal.ZERO;

        BigDecimal orderTotal =
                BigDecimal.ZERO;

        int totalItems = 0;

        LocalDateTime now =
                LocalDateTime.now();

        for (CartItem cartItem :
                cart.getItems()) {

            int quantity =
                    cartItem.getQuantity();

            totalItems += quantity;

            Long variantId =
                    cartItem
                            .getProductVariant()
                            .getId();

            // -------------------------------------------------
            // CURRENT PRICE
            // -------------------------------------------------

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

            BigDecimal mrp =
                    money(price.getMrp());

            BigDecimal sellingPrice =
                    money(price.getSellingPrice());

            // -------------------------------------------------
            // CURRENT DISCOUNT
            // -------------------------------------------------

            ProductVariantDiscountEntity discount =
                    productVariantDiscountRepository
                            .findCurrentDiscount(
                                    variantId,
                                    now
                            )
                            .orElse(null);

            BigDecimal discountPerUnit =
                    calculateDiscount(
                            sellingPrice,
                            discount
                    );

            BigDecimal finalUnitPrice =
                    sellingPrice
                            .subtract(
                                    discountPerUnit
                            );

            if (finalUnitPrice.compareTo(
                    BigDecimal.ZERO) < 0) {

                finalUnitPrice =
                        BigDecimal.ZERO;
            }

            finalUnitPrice =
                    money(finalUnitPrice);

            // -------------------------------------------------
            // TOTALS
            // -------------------------------------------------

            BigDecimal quantityValue =
                    BigDecimal.valueOf(quantity);

            BigDecimal mrpTotal =
                    mrp.multiply(quantityValue);

            BigDecimal finalLineTotal =
                    finalUnitPrice
                            .multiply(quantityValue);

            BigDecimal itemDiscount =
                    mrpTotal.subtract(
                            finalLineTotal
                    );

            if (itemDiscount.compareTo(
                    BigDecimal.ZERO) < 0) {

                itemDiscount =
                        BigDecimal.ZERO;
            }

            productPrice =
                    productPrice.add(mrpTotal);

            totalDiscount =
                    totalDiscount.add(
                            itemDiscount
                    );

            orderTotal =
                    orderTotal.add(
                            finalLineTotal
                    );

            // -------------------------------------------------
            // ITEM RESPONSE
            // -------------------------------------------------

            CartItemResponseDTO itemResponse =
                    CartItemResponseDTO.builder()
                            .id(cartItem.getId())
                            .productId(
                                    cartItem
                                            .getProduct()
                                            .getId()
                            )
                            .productVariantId(
                                    variantId
                            )
                            .productName(
                                    cartItem
                                            .getProduct()
                                            .getName()
                            )
                            .quantity(quantity)
                            .unitPrice(
                                    finalUnitPrice
                            )
                            .lineTotal(
                                    money(finalLineTotal)
                            )
                            .build();

            responseItems.add(itemResponse);
        }

        return CartResponseDTO.builder()
                .id(cart.getId())
                .items(responseItems)
                .totalItems(totalItems)
                .productPrice(
                        money(productPrice)
                )
                .totalDiscount(
                        money(totalDiscount)
                )
                .orderTotal(
                        money(orderTotal)
                )
                .build();
    }

    // =========================================================
    // DISCOUNT CALCULATION
    // =========================================================

    private BigDecimal calculateDiscount(
            BigDecimal sellingPrice,
            ProductVariantDiscountEntity discount) {

        if (discount == null) {
            return BigDecimal.ZERO;
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
                BigDecimal.ZERO) < 0) {

            discountAmount =
                    BigDecimal.ZERO;
        }

        /*
         * Never allow discount to exceed
         * the selling price.
         */
        if (discountAmount.compareTo(
                sellingPrice) > 0) {

            discountAmount =
                    sellingPrice;
        }

        return money(discountAmount);
    }

    // =========================================================
    // MONEY
    // =========================================================

    private BigDecimal money(
            BigDecimal value) {

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