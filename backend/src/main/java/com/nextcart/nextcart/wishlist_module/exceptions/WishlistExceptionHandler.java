package com.nextcart.nextcart.wishlist_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.wishlist_module"
)
public class WishlistExceptionHandler {

    @ExceptionHandler(WishlistNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleWishlistNotFound(
            WishlistNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "WISHLIST_NOT_FOUND"
                )
        );
    }

    @ExceptionHandler(WishlistAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleWishlistAlreadyExists(
            WishlistAlreadyExistsException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "WISHLIST_ALREADY_EXISTS"
                )
        );
    }

    @ExceptionHandler(WishlistUserNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleWishlistUserNotFound(
            WishlistUserNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "WISHLIST_USER_NOT_FOUND"
                )
        );
    }

    @ExceptionHandler(WishlistProductNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleWishlistProductNotFound(
            WishlistProductNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "WISHLIST_PRODUCT_NOT_FOUND"
                )
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleValidation(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Validation failed");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                )
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "VALIDATION_ERROR"
                )
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        "Invalid request body",
                        null,
                        "INVALID_REQUEST_BODY"
                )
        );
    }
}