package com.nextcart.nextcart.service.cart;

import com.nextcart.nextcart.dto.cart.AddToCartRequestDTO;
import com.nextcart.nextcart.dto.cart.CartResponseDTO;
import com.nextcart.nextcart.dto.cart.UpdateCartItemRequestDTO;

public interface CartService {

    CartResponseDTO getCart();

    CartResponseDTO addToCart(AddToCartRequestDTO request);

    CartResponseDTO updateCartItem(Long productId, UpdateCartItemRequestDTO request);

    CartResponseDTO removeFromCart(Long productId);

    void clearCart();
}