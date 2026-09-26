package com.nextcart.nextcart.product_module.variantAttribute.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.product_module.productVariant.exceptions.ProductVariantNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.product_module.variantAttribute"
)
public class VariantAttributeExceptionHandler {

    // =========================================================
    // VARIANT ATTRIBUTE NOT FOUND
    // =========================================================

    @ExceptionHandler(VariantAttributeNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleVariantAttributeNotFound(
            VariantAttributeNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "VARIANT_ATTRIBUTE_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // VARIANT ATTRIBUTE ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(VariantAttributeAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleVariantAttributeAlreadyExists(
            VariantAttributeAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "VARIANT_ATTRIBUTE_ALREADY_EXISTS"
                        )
                );
    }

    // =========================================================
    // PRODUCT VARIANT NOT FOUND
    // =========================================================

    @ExceptionHandler(ProductVariantNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductVariantNotFound(
            ProductVariantNotFoundException ex) {

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
    // VALIDATION ERROR
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error ->
                        error.getField()
                                + ": "
                                + error.getDefaultMessage()
                )
                .collect(Collectors.joining(", "));

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
    // INVALID REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

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