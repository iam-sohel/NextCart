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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
   private final ProductVariantPriceRepository productVariantPriceRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated");
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
                                "User not found with email: " + email));
    }

    private Cart getOrCreateCart() {

        User user = getAuthenticatedUser();

        return cartRepository
                .findByUser(user)
                .orElseGet(() ->
                        cartRepository.save(
                                new Cart(user)));
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponseDTO getCart() {

        Cart cart = getOrCreateCart();

        return mapToCartResponseDTO(cart);
    }

    @Override
    public CartResponseDTO addToCart(
            AddToCartRequestDTO request) {

        Cart cart = getOrCreateCart();

        if (request.getVariantId() == null) {
            throw new RuntimeException(
                    "Variant ID is required");
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        ProductVariantPriceEntity productVariant =
                productVariantPriceRepository
                        .findById(request.getVariantId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product variant not found with id: "
                                                + request.getVariantId()));

        ProductVariantPriceEntity product =
                productVariant.getProduct();

        if (product == null) {
            throw new RuntimeException(
                    "Product not found for variant");
        }

        if (productVariant.getPrice() == null) {
            throw new RuntimeException(
                    "Price not found for product variant");
        }

        Optional<CartItem> existingItemOptional =
                cartItemRepository
                        .findByCartIdAndProductVariantId(
                                cart.getId(),
                                productVariant.getId());

        if (existingItemOptional.isPresent()) {

            CartItem existingItem =
                    existingItemOptional.get();

            existingItem.setQuantity(
                    existingItem.getQuantity()
                            + request.getQuantity());

            cartItemRepository.save(existingItem);

        } else {

            CartItem cartItem =
                    new CartItem(
                            cart,
                            product,
                            productVariant,
                            request.getQuantity());

            cartItemRepository.save(cartItem);

            cart.getItems().add(cartItem);
        }

        updateCartTotal(cart);

        Cart savedCart =
                cartRepository.save(cart);

        return mapToCartResponseDTO(savedCart);
    }

    @Override
    public CartResponseDTO updateCartItem(
            Long variantId,
            UpdateCartItemRequestDTO request) {

        Cart cart = getOrCreateCart();

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        CartItem cartItem =
                cartItemRepository
                        .findByCartIdAndProductVariantId(
                                cart.getId(),
                                variantId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product variant not found in cart"));

        cartItem.setQuantity(
                request.getQuantity());

        cartItemRepository.save(cartItem);

        updateCartTotal(cart);

        Cart savedCart =
                cartRepository.save(cart);

        return mapToCartResponseDTO(savedCart);
    }

    @Override
    public CartResponseDTO removeFromCart(
            Long variantId) {

        Cart cart = getOrCreateCart();

        Optional<CartItem> itemOptional =
                cartItemRepository
                        .findByCartIdAndProductVariantId(
                                cart.getId(),
                                variantId);

        if (itemOptional.isPresent()) {

            CartItem cartItem =
                    itemOptional.get();

            cart.getItems().remove(cartItem);

            cartItemRepository.delete(cartItem);
        }

        updateCartTotal(cart);

        Cart savedCart =
                cartRepository.save(cart);

        return mapToCartResponseDTO(savedCart);
    }

    @Override
    public void clearCart() {

        Cart cart = getOrCreateCart();

        cartItemRepository.deleteByCartId(
                cart.getId());

        cart.getItems().clear();

        cart.setTotalAmount(
                BigDecimal.ZERO);

        cartRepository.save(cart);
    }

    private void updateCartTotal(Cart cart) {

        BigDecimal total =
                cart.getItems()
                        .stream()
                        .map(item -> {

                            if (item.getProductVariant() == null ||
                                    item.getProductVariant().getPrice() == null) {

                                return BigDecimal.ZERO;
                            }

                            return item.getProductVariant()
                                    .getPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    item.getQuantity()));
                        })
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add);

        cart.setTotalAmount(total);
    }

    private CartResponseDTO mapToCartResponseDTO(
            Cart cart) {

        List<CartItemResponseDTO> itemDTOs =
                cart.getItems()
                        .stream()
                        .map(item -> {

                            Product product =
                                    item.getProduct();

                            ProductVariantEntity variant =
                                    item.getProductVariant();

                            BigDecimal price =
                                    variant != null
                                            ? variant.getPrice()
                                            : BigDecimal.ZERO;

                            BigDecimal itemTotal =
                                    price.multiply(
                                            BigDecimal.valueOf(
                                                    item.getQuantity()));

                            return new CartItemResponseDTO(
                                    item.getId(),
                                    product.getId(),
                                    product.getName(),
                                    null,
                                    price,
                                    item.getQuantity(),
                                    itemTotal
                            );
                        })
                        .collect(Collectors.toList());

        CartResponseDTO response =
                new CartResponseDTO();

        response.setId(cart.getId());

        if (cart.getUser() != null) {
            response.setUserId(
                    cart.getUser().getId());
        }

        response.setSessionId(
                cart.getSessionId());

        response.setItems(itemDTOs);

        int totalItems =
                itemDTOs
                        .stream()
                        .mapToInt(
                                CartItemResponseDTO::getQuantity)
                        .sum();

        BigDecimal grandTotal =
                itemDTOs
                        .stream()
                        .map(
                                CartItemResponseDTO::getItemTotal)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add);

        response.setTotalItems(totalItems);
        response.setGrandTotal(grandTotal);

        return response;
    }
}