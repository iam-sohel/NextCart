package com.nextcart.nextcart.cart_module;

import com.nextcart.nextcart.cart_module.dto.CartItemResponseDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CartMapper {

    public CartItemResponseDTO toCartItemResponse(
            CartItem cartItem,
            BigDecimal mrp,
            BigDecimal sellingPrice,
            BigDecimal discountAmount,
            BigDecimal unitPrice,
            BigDecimal lineTotal,
            String currency) {

        return CartItemResponseDTO.builder()
                .id(cartItem.getId())
                .productId(
                        cartItem.getProduct().getId()
                )
                .productVariantId(
                        cartItem.getProductVariant().getId()
                )
                .sku(
                        cartItem.getProductVariant().getSku()
                )
                .productName(
                        cartItem.getProduct().getName()
                )
                .quantity(cartItem.getQuantity())
                .mrp(mrp)
                .sellingPrice(sellingPrice)
                .discountAmount(discountAmount)
                .unitPrice(unitPrice)
                .lineTotal(lineTotal)
                .currency(currency)
                .build();
    }

    public CartResponseDTO toCartResponse(
            Cart cart,
            List<CartItemResponseDTO> items,
            Integer totalItems,
            BigDecimal productPrice,
            BigDecimal totalDiscount,
            BigDecimal orderTotal,
            String currency) {

        return CartResponseDTO.builder()
                .id(cart.getId())
                .items(items)
                .totalItems(totalItems)
                .productPrice(productPrice)
                .totalDiscount(totalDiscount)
                .orderTotal(orderTotal)
                .currency(currency)
                .build();
    }
}