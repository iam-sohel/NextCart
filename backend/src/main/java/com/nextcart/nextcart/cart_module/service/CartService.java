package com.nextcart.nextcart.cart_module.service;

import com.nextcart.nextcart.cart_module.dto.AddToCartRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.cart_module.dto.UpdateCartItemRequestDTO;

public interface CartService {

    CartResponseDTO getCart();

    CartResponseDTO addToCart(AddToCartRequestDTO request);

    CartResponseDTO updateCartItem(Long productId, UpdateCartItemRequestDTO request);

    CartResponseDTO removeFromCart(Long productId);

    void clearCart();
}