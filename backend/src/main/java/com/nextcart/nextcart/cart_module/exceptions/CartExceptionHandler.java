package com.nextcart.nextcart.cart_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.cart_module.controller"
)
public class CartExceptionHandler {

    // =========================================================
    // CART ITEM NOT FOUND
    // =========================================================

    @ExceptionHandler(CartItemNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCartItemNotFound(
            CartItemNotFoundException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CART_ITEM_NOT_FOUND"
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    // =========================================================
    // CART NOT FOUND
    // =========================================================

    @ExceptionHandler(CartNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCartNotFound(
            CartNotFoundException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CART_NOT_FOUND"
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    // =========================================================
    // CART PRICE NOT FOUND
    // =========================================================

    @ExceptionHandler(CartPriceNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCartPriceNotFound(
            CartPriceNotFoundException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CART_PRICE_NOT_FOUND"
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    // =========================================================
    // PRODUCT VARIANT NOT FOUND
    // =========================================================

    @ExceptionHandler(CartProductVariantNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleProductVariantNotFound(
            CartProductVariantNotFoundException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CART_PRODUCT_VARIANT_NOT_FOUND"
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    // =========================================================
    // CART USER NOT FOUND
    // =========================================================

    @ExceptionHandler(CartUserNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCartUserNotFound(
            CartUserNotFoundException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CART_USER_NOT_FOUND"
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    // =========================================================
    // INVALID CART QUANTITY
    // =========================================================

    @ExceptionHandler(InvalidCartQuantityException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidCartQuantity(
            InvalidCartQuantityException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "INVALID_CART_QUANTITY"
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // =========================================================
    // VALIDATION ERROR
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error ->
                        error.getField()
                                + ": "
                                + error.getDefaultMessage()
                )
                .orElse("Validation failed");

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // =========================================================
    // CONSTRAINT VIOLATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {

        String message = ex.getConstraintViolations()
                .stream()
                .findFirst()
                .map(violation ->
                        violation.getPropertyPath()
                                + ": "
                                + violation.getMessage()
                )
                .orElse("Validation failed");

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // =========================================================
    // INVALID REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

        CommonResponseDto<Void> response =
                new CommonResponseDto<>(
                        false,
                        "Invalid request body",
                        null,
                        "INVALID_REQUEST_BODY"
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }
}