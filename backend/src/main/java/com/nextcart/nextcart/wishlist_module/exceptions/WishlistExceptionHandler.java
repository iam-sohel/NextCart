package com.nextcart.nextcart.wishlist_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages =
                "com.nextcart.nextcart.wishlist_module.controller"
)
public class WishlistExceptionHandler {

    // =========================================================
    // WISHLIST NOT FOUND
    // =========================================================

    @ExceptionHandler(WishlistNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleWishlistNotFound(
            WishlistNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "WISHLIST_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // WISHLIST ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(WishlistAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleWishlistAlreadyExists(
            WishlistAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "WISHLIST_ALREADY_EXISTS"
                        )
                );
    }

    // =========================================================
    // WISHLIST VALIDATION
    // =========================================================

    @ExceptionHandler(WishlistValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleWishlistValidation(
            WishlistValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "WISHLIST_VALIDATION_ERROR"
                        )
                );
    }
}