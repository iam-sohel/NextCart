package com.nextcart.nextcart.wishlist_module.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.wishlist_module.dto.WishlistResponseDTO;
import com.nextcart.nextcart.wishlist_module.service.WishlistService;

@RestController
@RequestMapping("/api/v1/wishlist")
@PreAuthorize("hasRole('CUSTOMER')")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponseDTO>> addToWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);

        WishlistResponseDTO responseDTO =
                wishlistService.addToWishlist(userId, productId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Product added to wishlist successfully",
                        responseDTO
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponseDTO>>> getUserWishlist(
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);

        List<WishlistResponseDTO> wishlist =
                wishlistService.getUserWishlist(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Wishlist fetched successfully",
                        wishlist
                )
        );
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<ApiResponse<String>> removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);

        wishlistService.removeFromWishlist(userId, productId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product removed from wishlist successfully",
                        null
                )
        );
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearWishlist(
            Authentication authentication) {

        Long userId = getLoggedInUserId(authentication);

        wishlistService.clearWishlist(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Wishlist cleared successfully",
                        null
                )
        );
    }

    private Long getLoggedInUserId(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        }

        return Long.valueOf(authentication.getName());
    }
}

