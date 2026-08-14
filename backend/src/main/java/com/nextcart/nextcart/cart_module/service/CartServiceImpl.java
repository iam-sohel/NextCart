package com.nextcart.nextcart.cart_module.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nextcart.nextcart.cart_module.dto.AddToCartRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemResponseDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.cart_module.dto.UpdateCartItemRequestDTO;
import com.nextcart.nextcart.cart_module.entity.Cart;
import com.nextcart.nextcart.cart_module.entity.CartItem;
import com.nextcart.nextcart.entity.User;
import com.nextcart.nextcart.cart_module.repository.CartItemRepository;
import com.nextcart.nextcart.cart_module.repository.CartRepository;
import com.nextcart.nextcart.user_module.repository.UserRepository;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        String email;

        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String principalString) {
            email = principalString;
        } else {
            email = authentication.getName();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    private Cart getOrCreateCart() {
        User user = getAuthenticatedUser();
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(new Cart(user)));
    }

    @Override
    public CartResponseDTO getCart() {
        Cart cart = getOrCreateCart();
        return mapToCartResponseDTO(cart);
    }

    @Override
    public CartResponseDTO addToCart(AddToCartRequestDTO request) {
        Cart cart = getOrCreateCart();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem(cart, product, request.getQuantity());
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToCartResponseDTO(cartRepository.findById(cart.getId()).get());
    }

    @Override
    public CartResponseDTO updateCartItem(Long productId, UpdateCartItemRequestDTO request) {
        Cart cart = getOrCreateCart();
        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found in cart for product id: " + productId));

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return mapToCartResponseDTO(cartRepository.findById(cart.getId()).get());
    }

    @Override
    public CartResponseDTO removeFromCart(Long productId) {
        Cart cart = getOrCreateCart();
        
        Optional<CartItem> itemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            cart.removeItem(item);
            cartItemRepository.delete(item);
        }

        return mapToCartResponseDTO(cartRepository.save(cart));
    }

    @Override
    public void clearCart() {
        Cart cart = getOrCreateCart();
        cart.getItems().clear();
        cartItemRepository.deleteByCartId(cart.getId());
    }

    private CartResponseDTO mapToCartResponseDTO(Cart cart) {
        CartResponseDTO dto = new CartResponseDTO();
        dto.setId(cart.getId());
        if (cart.getUser() != null) {
            dto.setUserId(cart.getUser().getId());
        }
        dto.setSessionId(cart.getSessionId());

        List<CartItemResponseDTO> itemDTOs = cart.getItems().stream().map(item -> {
            BigDecimal price = item.getProduct().getPrice();
            BigDecimal total = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            return new CartItemResponseDTO(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    null,
                    price,
                    item.getQuantity(),
                    total
            );
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);

        int totalItems = itemDTOs.stream().mapToInt(CartItemResponseDTO::getQuantity).sum();
        BigDecimal grandTotal = itemDTOs.stream()
                .map(CartItemResponseDTO::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setTotalItems(totalItems);
        dto.setGrandTotal(grandTotal);

        return dto;
    }
}