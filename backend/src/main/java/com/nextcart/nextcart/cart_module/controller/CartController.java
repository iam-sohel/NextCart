package com.nextcart.nextcart.cart_module.controller;

import com.nextcart.nextcart.cart_module.dto.AddToCartRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.cart_module.dto.UpdateCartItemRequestDTO;
import com.nextcart.nextcart.cart_module.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // =========================================================
    // GET CART
    // =========================================================

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart() {

        return ResponseEntity.ok(
                cartService.getCart()
        );
    }

    // =========================================================
    // ADD TO CART
    // =========================================================

    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addToCart(
            @RequestBody AddToCartRequestDTO request) {

        return ResponseEntity.ok(
                cartService.addToCart(request)
        );
    }

    // =========================================================
    // UPDATE CART ITEM
    // =========================================================

    @PutMapping("/items/{variantId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(
            @PathVariable Long variantId,
            @RequestBody UpdateCartItemRequestDTO request) {

        return ResponseEntity.ok(
                cartService.updateCartItem(
                        variantId,
                        request
                )
        );
    }

    // =========================================================
    // REMOVE CART ITEM
    // =========================================================

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<CartResponseDTO> removeFromCart(
            @PathVariable Long variantId) {

        return ResponseEntity.ok(
                cartService.removeFromCart(
                        variantId
                )
        );
    }

    // =========================================================
    // CLEAR CART
    // =========================================================

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {

        cartService.clearCart();

        return ResponseEntity.noContent().build();
    }
}