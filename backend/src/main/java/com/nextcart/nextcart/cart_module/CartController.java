package com.nextcart.nextcart.cart_module;

import com.nextcart.nextcart.cart_module.dto.CartItemAddRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartItemUpdateRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // =========================================================
    // GET CART
    // =========================================================

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(
            Authentication authentication) {

        String userEmail = authentication.getName();

        return ResponseEntity.ok(
                cartService.getCart(userEmail)
        );
    }

    // =========================================================
    // ADD ITEM
    // =========================================================

    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addItem(
            Authentication authentication,
            @Valid @RequestBody
            CartItemAddRequestDTO request) {

        String userEmail = authentication.getName();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        cartService.addItem(
                                userEmail,
                                request
                        )
                );
    }

    // =========================================================
    // UPDATE ITEM
    // =========================================================

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponseDTO> updateItem(
            Authentication authentication,

            @PathVariable
            @Positive(message = "Cart item ID must be greater than 0")
            Long itemId,

            @Valid @RequestBody
            CartItemUpdateRequestDTO request) {

        String userEmail = authentication.getName();

        return ResponseEntity.ok(
                cartService.updateItem(
                        userEmail,
                        itemId,
                        request
                )
        );
    }

    // =========================================================
    // REMOVE ITEM
    // =========================================================

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(
            Authentication authentication,

            @PathVariable
            @Positive(message = "Cart item ID must be greater than 0")
            Long itemId) {

        String userEmail = authentication.getName();

        cartService.removeItem(
                userEmail,
                itemId
        );

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // CLEAR CART
    // =========================================================

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            Authentication authentication) {

        String userEmail = authentication.getName();

        cartService.clearCart(userEmail);

        return ResponseEntity.noContent().build();
    }
}