package com.nextcart.nextcart.cart_module;

import com.nextcart.nextcart.cart_module.dto.CartItemAddRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemUpdateRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;

public interface CartService {

    CartResponseDTO getCart(String userIdentifier);

    CartResponseDTO addItem(
            String userIdentifier,
            CartItemAddRequestDTO request
    );

    CartResponseDTO updateItem(
            String userIdentifier,
            Long itemId,
            CartItemUpdateRequestDTO request
    );

    void removeItem(
            String userIdentifier,
            Long itemId
    );

    void clearCart(String userIdentifier);
}