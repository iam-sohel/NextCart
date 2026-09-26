package com.nextcart.nextcart.product_module.productPrice.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.product_module.productVariant.exceptions.ProductVariantNotFoundException;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.product_module.productPrice"
)
public class ProductVariantPriceExceptionHandler {


    // =========================================================
    // PRICE NOT FOUND
    // =========================================================

    @ExceptionHandler(ProductVariantPriceNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handlePriceNotFound(
            ProductVariantPriceNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_VARIANT_PRICE_NOT_FOUND"
                        )
                );
    }


    // =========================================================
    // PRICE ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(ProductVariantPriceAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handlePriceAlreadyExists(
            ProductVariantPriceAlreadyExistsException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_VARIANT_PRICE_ALREADY_EXISTS"
                        )
                );
    }


    // =========================================================
    // INVALID PRICE
    // =========================================================

    @ExceptionHandler(InvalidPriceException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidPrice(
            InvalidPriceException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "INVALID_PRICE"
                        )
                );
    }


    // =========================================================
    // PRODUCT VARIANT NOT FOUND
    // =========================================================

    @ExceptionHandler(ProductVariantNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductVariantNotFound(
            ProductVariantNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_VARIANT_NOT_FOUND"
                        )
                );
    }


    // =========================================================
    // BEAN VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleValidation(
            MethodArgumentNotValidException ex
    ) {

        String message =
                ex.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .findFirst()
                        .map(error ->
                                error.getField()
                                        + ": "
                                        + error.getDefaultMessage()
                        )
                        .orElse("Validation failed");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                message,
                                null,
                                "VALIDATION_ERROR"
                        )
                );
    }


    // =========================================================
    // CONSTRAINT VALIDATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleConstraintViolation(
            ConstraintViolationException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "VALIDATION_ERROR"
                        )
                );
    }


    // =========================================================
    // INVALID REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidRequestBody(
            HttpMessageNotReadableException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                "Invalid request body",
                                null,
                                "INVALID_REQUEST_BODY"
                        )
                );
    }
}