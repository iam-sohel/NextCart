package com.nextcart.nextcart.cart_module.service;

import com.nextcart.nextcart.cart_module.dto.AddToCartRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemResponseDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.cart_module.dto.UpdateCartItemRequestDTO;
import com.nextcart.nextcart.cart_module.entity.Cart;
import com.nextcart.nextcart.cart_module.entity.CartItem;
import com.nextcart.nextcart.cart_module.repository.CartItemRepository;
import com.nextcart.nextcart.cart_module.repository.CartRepository;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceEntity;
import com.nextcart.nextcart.product_module.productPrice.ProductVariantPriceRepository;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantPriceRepository productVariantPriceRepository;
    private final UserRepository userRepository;

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        Object principal =
                authentication.getPrincipal();

        String email;

        if (principal instanceof UserDetails userDetails) {

            email = userDetails.getUsername();

        } else if (principal instanceof String principalString) {

            email = principalString;

        } else {

            email = authentication.getName();
        }

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: "
                                        + email
                        )
                );
    }

    // =========================================================
    // GET OR CREATE CART
    // =========================================================

    private Cart getOrCreateCart() {

        User user = getAuthenticatedUser();

        return cartRepository
                .findByUser(user)
                .orElseGet(() ->
                        cartRepository.save(
                                Cart.builder()
                                        .user(user)
                                        .totalAmount(BigDecimal.ZERO)
                                        .build()
                        )
                );
    }

    // =========================================================
    // GET CART
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCart() {

        Cart cart = getOrCreateCart();

        return mapToResponse(cart);
    }

    // =========================================================
    // ADD TO CART
    // =========================================================

    @Override
    public CartResponseDTO addToCart(
            AddToCartRequestDTO request) {

        if (request == null) {

            throw new RuntimeException(
                    "Add to cart request is required"
            );
        }

        if (request.getVariantId() == null) {

            throw new RuntimeException(
                    "Product variant ID is required"
            );
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        Long variantId =
                request.getVariantId();

        Cart cart =
                getOrCreateCart();

        ProductVariantEntity variant =
                productVariantRepository
                        .findById(variantId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product variant not found with id: "
                                                + variantId
                                )
                        );

        if (variant.getProductEntity() == null) {

            throw new RuntimeException(
                    "Product not found for product variant id: "
                            + variantId
            );
        }

        /*
         * If productId is supplied,
         * verify that it belongs to this variant.
         */
        if (request.getProductId() != null &&
                !request.getProductId()
                        .equals(
                                variant
                                        .getProductEntity()
                                        .getId()
                        )) {

            throw new RuntimeException(
                    "Product ID does not match the product variant"
            );
        }

        /*
         * Make sure selling price exists.
         */
        getSellingPrice(variantId);

        Optional<CartItem> existingItem =
                cartItemRepository
                        .findByCartIdAndProductVariantId(
                                cart.getId(),
                                variantId
                        );

        if (existingItem.isPresent()) {

            CartItem cartItem =
                    existingItem.get();

            cartItem.setQuantity(
                    cartItem.getQuantity()
                            + request.getQuantity()
            );

            cartItemRepository.save(cartItem);

        } else {

            CartItem cartItem =
                    new CartItem(
                            cart,
                            variant.getProductEntity(),
                            variant,
                            request.getQuantity()
                    );

            cartItemRepository.save(cartItem);

            cart.getItems().add(cartItem);
        }

        updateCartTotal(cart);

        cartRepository.save(cart);

        return mapToResponse(cart);
    }

    // =========================================================
    // UPDATE CART ITEM
    // =========================================================

    @Override
    public CartResponseDTO updateCartItem(
            Long variantId,
            UpdateCartItemRequestDTO request) {

        if (variantId == null) {

            throw new RuntimeException(
                    "Product variant ID is required"
            );
        }

        if (request == null ||
                request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        Cart cart =
                getOrCreateCart();

        productVariantRepository
                .findById(variantId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product variant not found with id: "
                                        + variantId
                        )
                );

        getSellingPrice(variantId);

        CartItem cartItem =
                cartItemRepository
                        .findByCartIdAndProductVariantId(
                                cart.getId(),
                                variantId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product variant not found in cart"
                                )
                        );

        cartItem.setQuantity(
                request.getQuantity()
        );

        cartItemRepository.save(cartItem);

        updateCartTotal(cart);

        cartRepository.save(cart);

        return mapToResponse(cart);
    }

    // =========================================================
    // REMOVE FROM CART
    // =========================================================

    @Override
    public CartResponseDTO removeFromCart(
            Long variantId) {

        if (variantId == null) {

            throw new RuntimeException(
                    "Product variant ID is required"
            );
        }

        Cart cart =
                getOrCreateCart();

        Optional<CartItem> itemOptional =
                cartItemRepository
                        .findByCartIdAndProductVariantId(
                                cart.getId(),
                                variantId
                        );

        if (itemOptional.isPresent()) {

            CartItem cartItem =
                    itemOptional.get();

            cart.getItems().remove(cartItem);

            cartItemRepository.delete(cartItem);
        }

        updateCartTotal(cart);

        cartRepository.save(cart);

        return mapToResponse(cart);
    }

    // =========================================================
    // CLEAR CART
    // =========================================================

    @Override
    public void clearCart() {

        Cart cart =
                getOrCreateCart();

        cartItemRepository.deleteByCartId(
                cart.getId()
        );

        cart.getItems().clear();

        cart.setTotalAmount(
                BigDecimal.ZERO
        );

        cartRepository.save(cart);
    }

    // =========================================================
    // GET SELLING PRICE BY VARIANT ID
    // =========================================================

    private BigDecimal getSellingPrice(
            Long variantId) {

        ProductVariantPriceEntity price =
                productVariantPriceRepository
                        .findByProductVariantId(variantId)
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

        return price.getSellingPrice();
    }

    // =========================================================
    // UPDATE CART TOTAL
    // =========================================================

    private void updateCartTotal(
            Cart cart) {

        BigDecimal total =
                cart.getItems()
                        .stream()
                        .map(item -> {

                            ProductVariantEntity variant =
                                    item.getProductVariant();

                            if (variant == null) {

                                throw new RuntimeException(
                                        "Product variant not found for cart item id: "
                                                + item.getId()
                                );
                            }

                            BigDecimal sellingPrice =
                                    getSellingPrice(
                                            variant.getId()
                                    );

                            return sellingPrice.multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );
                        })
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        cart.setTotalAmount(total);
    }

    // =========================================================
    // MAP CART TO RESPONSE
    // =========================================================

    private CartResponseDTO mapToResponse(
            Cart cart) {

        List<CartItemResponseDTO> itemResponses =
                cart.getItems()
                        .stream()
                        .map(this::mapItemToResponse)
                        .toList();

        Integer totalItems =
                itemResponses
                        .stream()
                        .mapToInt(
                                CartItemResponseDTO::getQuantity
                        )
                        .sum();

        BigDecimal grandTotal =
                itemResponses
                        .stream()
                        .map(
                                CartItemResponseDTO::getItemTotal
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return CartResponseDTO.builder()
                .id(cart.getId())
                .userId(
                        cart.getUser() != null
                                ? cart.getUser().getId()
                                : null
                )
                .sessionId(cart.getSessionId())
                .items(itemResponses)
                .totalItems(totalItems)
                .grandTotal(grandTotal)
                .build();
    }

    // =========================================================
    // MAP CART ITEM TO RESPONSE
    // =========================================================

    private CartItemResponseDTO mapItemToResponse(
            CartItem item) {

        ProductVariantEntity variant =
                item.getProductVariant();

        if (variant == null) {

            throw new RuntimeException(
                    "Product variant not found for cart item id: "
                            + item.getId()
            );
        }

        if (variant.getProductEntity() == null) {

            throw new RuntimeException(
                    "Product not found for product variant id: "
                            + variant.getId()
            );
        }

        BigDecimal sellingPrice =
                getSellingPrice(
                        variant.getId()
                );

        BigDecimal itemTotal =
                sellingPrice.multiply(
                        BigDecimal.valueOf(
                                item.getQuantity()
                        )
                );

        return CartItemResponseDTO.builder()
                .id(item.getId())
                .productId(
                        variant
                                .getProductEntity()
                                .getId()
                )
                .productName(
                        variant
                                .getProductEntity()
                                .getName()
                )
                .productImage(null)
                .price(sellingPrice)
                .quantity(item.getQuantity())
                .itemTotal(itemTotal)
                .build();
    }
}