package com.nextcart.nextcart.wishlist_module.controller;

import java.util.List;

import com.nextcart.nextcart.auth_module.security.CustomUserDetails;
import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.wishlist_module.dto.WishlistResponseDTO;
import com.nextcart.nextcart.wishlist_module.service.WishlistService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@SecurityRequirement(name = "bearerAuth")
public class WishlistController {

    private final WishlistService wishlistService;

    // =========================================================
    // ADD PRODUCT TO WISHLIST
    // =========================================================

    @PostMapping("/add/{productId}")
    public ResponseEntity<CommonResponseDto<WishlistResponseDTO>>
    addToWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        Long userId =
                getLoggedInUserId(authentication);

        WishlistResponseDTO response =
                wishlistService.addToWishlist(
                        userId,
                        productId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Product added to wishlist successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET USER WISHLIST
    // =========================================================

    @GetMapping
    public ResponseEntity<
            CommonResponseDto<List<WishlistResponseDTO>>
            >
    getUserWishlist(
            Authentication authentication) {

        Long userId =
                getLoggedInUserId(authentication);

        List<WishlistResponseDTO> wishlist =
                wishlistService.getUserWishlist(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Wishlist fetched successfully",
                        wishlist
                )
        );
    }

    // =========================================================
    // REMOVE PRODUCT FROM WISHLIST
    // =========================================================

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CommonResponseDto<Void>>
    removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        Long userId =
                getLoggedInUserId(authentication);

        wishlistService.removeFromWishlist(
                userId,
                productId
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Product removed from wishlist successfully",
                        null
                )
        );
    }

    // =========================================================
    // CLEAR WISHLIST
    // =========================================================

    @DeleteMapping("/clear")
    public ResponseEntity<CommonResponseDto<Void>>
    clearWishlist(
            Authentication authentication) {

        Long userId =
                getLoggedInUserId(authentication);

        wishlistService.clearWishlist(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Wishlist cleared successfully",
                        null
                )
        );
    }

    // =========================================================
    // GET LOGGED-IN USER ID
    // =========================================================

    private Long getLoggedInUserId(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {

            Long userId = userDetails.getUserId();

            if (userId == null || userId <= 0) {
                throw new IllegalStateException(
                        "Authenticated user ID is required"
                );
            }

            return userId;
        }

        try {

            return Long.valueOf(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            throw new IllegalStateException(
                    "Unable to determine authenticated user"
            );
        }
    }
}