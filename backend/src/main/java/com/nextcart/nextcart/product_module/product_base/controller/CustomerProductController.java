package com.nextcart.nextcart.product_module.product_base.controller;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.cart_module.CartService;
import com.nextcart.nextcart.cart_module.dto.CartItemAddRequestDTO;
import com.nextcart.nextcart.cart_module.dto.CartResponseDTO;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.product_module.product_base.dto.ProductDetailsResponse;
import com.nextcart.nextcart.product_module.product_base.service.ProductService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProductController {

    private final ProductService productService;
    private final CartService cartService;


    // =========================================================
    // GET PRODUCTS
    // =========================================================

    @GetMapping("/products")
    public ResponseEntity<
            CommonResponseDto<Page<ProductDetailsResponse>>
            > getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.ASC,
                                "name"
                        )
                );

        Page<ProductDetailsResponse> response =
                productService.getAllProducts(pageable);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Products retrieved successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET PRODUCT DETAILS
    // =========================================================

    @GetMapping("/products/{productId}")
    public ResponseEntity<
            CommonResponseDto<ProductDetailsResponse>
            > getProductDetails(
            @PathVariable Long productId
    ) {

        ProductDetailsResponse response =
                productService.getProductDetailsById(
                        productId
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product details fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // ADD TO CART
    // =========================================================

    @PostMapping("/cart/items")
    public ResponseEntity<
            CommonResponseDto<CartResponseDTO>
            > addToCart(
            Authentication authentication,
            @Valid @RequestBody CartItemAddRequestDTO request
    ) {

        Long userId =
                getAuthenticatedUserId(authentication);

        CartResponseDTO response =
                cartService.addItem(
                        String.valueOf(userId),
                        request
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Item added to cart successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET CART
    // =========================================================

    @GetMapping("/cart")
    public ResponseEntity<
            CommonResponseDto<CartResponseDTO>
            > getCart(
            Authentication authentication
    ) {

        Long userId =
                getAuthenticatedUserId(authentication);

        CartResponseDTO response =
                cartService.getCart(
                        String.valueOf(userId)
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Cart fetched successfully",
                        response
                )
        );
    }


    // =========================================================
    // GET USER ID FROM JWT
    // =========================================================

    private Long getAuthenticatedUserId(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authenticated customer is required"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {

            throw new IllegalStateException(
                    "Authenticated customer details are unavailable"
            );
        }

        Long userId =
                userDetails.getUserId();

        if (userId == null || userId <= 0) {

            throw new IllegalStateException(
                    "Authenticated customer ID is invalid"
            );
        }

        return userId;
    }
}