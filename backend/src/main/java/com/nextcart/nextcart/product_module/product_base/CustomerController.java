package com.nextcart.nextcart.product_module.product_base;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.cart_module.CartService;
import com.nextcart.nextcart.cart_module.dto.CartItemAddRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.product_module.product_base.ProductService;
import com.nextcart.nextcart.product_module.product_base.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.product_base.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    private final ProductService productService;
    private final CartService cartService;

    // =========================================================
    // GET PRODUCTS
    // =========================================================

    @GetMapping("/products")
    public ResponseEntity<Page<ProductDetailsResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.ASC, "name")
        );

        return ResponseEntity.ok(
                productService.getAllProducts(pageable)
        );
    }

    // =========================================================
    // GET PRODUCT DETAILS
    // =========================================================

    @GetMapping("/products/{productId}")
    public ResponseEntity<ProductDetailsResponse> getProductDetails(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                productService.getProductDetailsById(productId)
        );
    }

    // =========================================================
    // ADD TO CART
    // =========================================================

    @PostMapping("/cart/items")
    public ResponseEntity<CartResponseDTO> addToCart(
            Authentication authentication,
            @Valid @RequestBody CartItemAddRequestDTO request) {

        Long userId = getAuthenticatedUserId(authentication);

        CartResponseDTO response = cartService.addItem(
                String.valueOf(userId),
                request
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET CART
    // =========================================================

    @GetMapping("/cart")
    public ResponseEntity<CartResponseDTO> getCart(
            Authentication authentication) {

        Long userId = getAuthenticatedUserId(authentication);

        return ResponseEntity.ok(
                cartService.getCart(String.valueOf(userId))
        );
    }

    // =========================================================
    // GET USER ID FROM JWT
    // =========================================================

    private Long getAuthenticatedUserId(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authenticated customer is required"
            );
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {

            throw new IllegalStateException(
                    "Authenticated customer details are unavailable"
            );
        }

        Long userId = userDetails.getUserId();

        if (userId == null || userId <= 0) {

            throw new IllegalStateException(
                    "Authenticated customer ID is invalid"
            );
        }

        return userId;
    }
}