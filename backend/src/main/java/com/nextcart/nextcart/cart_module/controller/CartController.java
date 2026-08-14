package com.nextcart.nextcart.cart_module.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextcart.nextcart.cart_module.dto.AddToCartRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.cart_module.dto.UpdateCartItemRequestDTO;
import com.nextcart.nextcart.cart_module.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addToCart(@Valid @RequestBody AddToCartRequestDTO request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemRequestDTO request) {
        return ResponseEntity.ok(cartService.updateCartItem(productId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponseDTO> removeFromCart(@PathVariable Long productId) {
        return ResponseEntity.ok(cartService.removeFromCart(productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}