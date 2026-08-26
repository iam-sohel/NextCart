package com.nextcart.nextcart.cart_module;

import com.nextcart.nextcart.cart_module.dto.CartItemAddRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemUpdateRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;

public interface CartService {

    CartResponseDTO getCart(String userEmail);

    CartResponseDTO addItem(String userEmail, CartItemAddRequestDTO request);

    CartResponseDTO updateItem(String userEmail, Long itemId, CartItemUpdateRequestDTO request);

    void removeItem(String userEmail, Long itemId);

    void clearCart(String userEmail);
}