package com.nextcart.nextcart.cart_module;




import com.nextcart.nextcart.cart_module.dto.CartItemResponseDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CartMapper {

    public CartItemResponseDTO toCartItemResponse(
            CartItem cartItem) {

        return CartItemResponseDTO.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productVariantId(cartItem.getProductVariant().getId())
                .productName(cartItem.getProduct().getName())
                .quantity(cartItem.getQuantity())
                .build();
    }

    public List<CartItemResponseDTO> toCartItemResponseList(
            Cart cart) {

        return cart.getItems()
                .stream()
                .map(this::toCartItemResponse)
                .toList();
    }

    public CartResponseDTO toCartResponse(
            Cart cart,
            List<CartItemResponseDTO> items) {

        return CartResponseDTO.builder()
                .id(cart.getId())
                .items(items)
                .build();
    }
}