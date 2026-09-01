package com.nextcart.nextcart.cart_module;

import com.nextcart.nextcart.cart_module.dto.CartItemAddRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemResponseDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemUpdateRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.cart_module.exceptions.CartItemNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartPriceNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartProductVariantNotFoundException;
import com.nextcart.nextcart.cart_module.exceptions.CartUserNotFoundException;
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
    private static final int MAX_CART_QUANTITY = 99;
    private static final String DEFAULT_CURRENCY = "INR";

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantPriceRepository productVariantPriceRepository;
    private final ProductVariantDiscountRepository productVariantDiscountRepository;
    private final CartMapper cartMapper;


    // =========================================================
    // GET CART
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(String userEmail) {

        User user = getUser(userEmail);

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (cart == null) {
            return emptyCart();
        }

        return buildCartResponse(cart);
    }


    // =========================================================
    // ADD ITEM
    // =========================================================

    @Override
    public CartResponseDTO addItem(
            String userEmail,
            CartItemAddRequestDTO request) {

        if (request == null) {
            throw new InvalidCartQuantityException(
                    "Cart item request is required"
            );
        }

        validateQuantity(request.getQuantity());

        User user = getUser(userEmail);

        ProductVariantEntity productVariant =
                getActiveProductVariant(
                        request.getProductVariantId()
                );

        Cart cart = getOrCreateCart(user);

        CartItem existingItem =
                cartItemRepository
                        .findByCartIdAndProductVariantId(
                                cart.getId(),
                                productVariant.getId()
                        )
                        .orElse(null);

        if (existingItem != null) {

            int currentQuantity =
                    existingItem.getQuantity() == null
                            ? 0
                            : existingItem.getQuantity();

            int newQuantity =
                    currentQuantity + request.getQuantity();

            validateQuantity(newQuantity);

            existingItem.setQuantity(newQuantity);

        } else {

            CartItem cartItem =
                    CartItem.builder()
                            .cart(cart)
                            .product(
                                    productVariant
                                            .getProductEntity()
                            )
                            .productVariant(productVariant)
                            .quantity(request.getQuantity())
                            .build();

            cart.addItem(cartItem);
        }

        cartRepository.save(cart);

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

        validateItemId(itemId);

        if (request == null) {
            throw new InvalidCartQuantityException(
                    "Cart item update request is required"
            );
        }

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

        return buildCartResponse(cart);
    }


    // =========================================================
    // REMOVE ITEM
    // =========================================================

    @Override
    public void removeItem(
            String userEmail,
            Long itemId) {

        validateItemId(itemId);

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

        Cart cart = cartRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (cart == null) {
            return;
        }

        cart.clearItems();

        cartRepository.save(cart);
    }


    // =========================================================
    // USER
    // =========================================================

    private User getUser(String userEmail) {

        if (userEmail == null ||
                userEmail.isBlank()) {

            throw new CartUserNotFoundException(
                    "Authenticated user is required"
            );
        }

        return userRepository
                .findByEmailIgnoreCase(
                        userEmail.trim()
                )
                .orElseThrow(() ->
                        new CartUserNotFoundException(
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


    private Cart getOrCreateCart(User user) {

        return cartRepository
                .findByUserId(user.getId())
                .orElseGet(() -> {

                    Cart cart = new Cart(user);

                    return cartRepository.save(cart);
                });
    }


    // =========================================================
    // PRODUCT VARIANT
    // =========================================================

    private ProductVariantEntity getActiveProductVariant(
            Long productVariantId) {

        if (productVariantId == null ||
                productVariantId <= 0) {

            throw new CartProductVariantNotFoundException(
                    "Invalid product variant ID"
            );
        }

        return productVariantRepository
                .findByIdAndStatus(
                        productVariantId,
                        ProductVariantStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new CartProductVariantNotFoundException(
                                "Active product variant not found with id: "
                                        + productVariantId
                        )
                );
    }


    // =========================================================
    // QUANTITY
    // =========================================================

    private void validateQuantity(Integer quantity) {

        if (quantity == null) {

            throw new InvalidCartQuantityException(
                    "Cart quantity is required"
            );
        }

        if (quantity < 1) {

            throw new InvalidCartQuantityException(
                    "Cart quantity must be at least 1"
            );
        }

        if (quantity > MAX_CART_QUANTITY) {

            throw new InvalidCartQuantityException(
                    "Maximum cart quantity is "
                            + MAX_CART_QUANTITY
            );
        }
    }


    private void validateItemId(Long itemId) {

        if (itemId == null ||
                itemId <= 0) {

            throw new CartItemNotFoundException(
                    "Invalid cart item ID"
            );
        }
    }


    // =========================================================
    // RESPONSE
    // =========================================================

    private CartResponseDTO buildCartResponse(
            Cart cart) {

        if (cart == null) {
            return emptyCart();
        }

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            return CartResponseDTO.builder()
                    .id(cart.getId())
                    .items(List.of())
                    .totalItems(0)
                    .productPrice(
                            money(BigDecimal.ZERO)
                    )
                    .totalDiscount(
                            money(BigDecimal.ZERO)
                    )
                    .orderTotal(
                            money(BigDecimal.ZERO)
                    )
                    .currency(DEFAULT_CURRENCY)
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

        String cartCurrency = DEFAULT_CURRENCY;

        LocalDateTime now =
                LocalDateTime.now();

        for (CartItem cartItem :
                cart.getItems()) {

            if (cartItem == null ||
                    cartItem.getProductVariant() == null ||
                    cartItem.getProduct() == null) {

                continue;
            }

            Integer quantity =
                    cartItem.getQuantity();

            if (quantity == null ||
                    quantity < 1) {

                continue;
            }

            totalItems += quantity;

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
                                    new CartPriceNotFoundException(
                                            "Price not found for product variant id: "
                                                    + variantId
                                    )
                            );

            BigDecimal mrp =
                    money(price.getMrp());

            BigDecimal sellingPrice =
                    money(price.getSellingPrice());

            String currency =
                    price.getCurrency();

            if (currency != null &&
                    !currency.isBlank()) {

                cartCurrency = currency.trim();
            }

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
                    money(
                            sellingPrice.subtract(
                                    discountPerUnit
                            )
                    );

            if (finalUnitPrice.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                finalUnitPrice =
                        money(BigDecimal.ZERO);
            }

            BigDecimal quantityValue =
                    BigDecimal.valueOf(quantity);

            BigDecimal mrpTotal =
                    money(
                            mrp.multiply(
                                    quantityValue
                            )
                    );

            BigDecimal lineTotal =
                    money(
                            finalUnitPrice.multiply(
                                    quantityValue
                            )
                    );

            BigDecimal itemDiscount =
                    money(
                            mrpTotal.subtract(
                                    lineTotal
                            )
                    );

            if (itemDiscount.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                itemDiscount =
                        money(BigDecimal.ZERO);
            }

            productPrice =
                    productPrice.add(mrpTotal);

            totalDiscount =
                    totalDiscount.add(itemDiscount);

            orderTotal =
                    orderTotal.add(lineTotal);

            CartItemResponseDTO itemResponse =
                    cartMapper.toCartItemResponse(
                            cartItem,
                            mrp,
                            sellingPrice,
                            discountPerUnit,
                            finalUnitPrice,
                            lineTotal,
                            currency
                    );

            responseItems.add(itemResponse);
        }

        return cartMapper.toCartResponse(
                cart,
                responseItems,
                totalItems,
                money(productPrice),
                money(totalDiscount),
                money(orderTotal),
                cartCurrency
        );
    }


    // =========================================================
    // EMPTY CART
    // =========================================================

    private CartResponseDTO emptyCart() {

        return CartResponseDTO.builder()
                .id(null)
                .items(List.of())
                .totalItems(0)
                .productPrice(
                        money(BigDecimal.ZERO)
                )
                .totalDiscount(
                        money(BigDecimal.ZERO)
                )
                .orderTotal(
                        money(BigDecimal.ZERO)
                )
                .currency(DEFAULT_CURRENCY)
                .build();
    }


    // =========================================================
    // DISCOUNT
    // =========================================================

    private BigDecimal calculateDiscount(
            BigDecimal sellingPrice,
            ProductVariantDiscountEntity discount) {

        if (discount == null ||
                sellingPrice == null ||
                sellingPrice.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            return money(BigDecimal.ZERO);
        }

        BigDecimal discountValue =
                discount.getDiscountValue();

        if (discountValue == null ||
                discountValue.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            return money(BigDecimal.ZERO);
        }

        BigDecimal discountAmount;

        if (discount.getDiscountType()
                == DiscountType.PERCENTAGE) {

            discountAmount =
                    sellingPrice
                            .multiply(discountValue)
                            .divide(
                                    BigDecimal.valueOf(100),
                                    MONEY_SCALE,
                                    RoundingMode.HALF_UP
                            );

        } else if (discount.getDiscountType()
                == DiscountType.FIXED_AMOUNT) {

            discountAmount =
                    discountValue;

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

        if (discountAmount.compareTo(
                sellingPrice
        ) > 0) {

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
