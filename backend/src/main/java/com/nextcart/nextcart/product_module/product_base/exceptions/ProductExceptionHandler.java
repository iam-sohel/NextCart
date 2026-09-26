package com.nextcart.nextcart.product_module.product_base.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.product_module.product_base"
)
public class ProductExceptionHandler {

    // =========================================================
    // PRODUCT NOT FOUND
    // =========================================================

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductNotFound(ProductNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // PRODUCT ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(ProductAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductAlreadyExists(ProductAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_ALREADY_EXISTS"
                        )
                );
    }

    // =========================================================
    // PRODUCT SLUG ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(ProductSlugAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductSlugAlreadyExists(
            ProductSlugAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_SLUG_ALREADY_EXISTS"
                        )
                );
    }

    // =========================================================
    // PRODUCT ALREADY ACTIVE
    // =========================================================

    @ExceptionHandler(ProductAlreadyActiveException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductAlreadyActive(
            ProductAlreadyActiveException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_ALREADY_ACTIVE"
                        )
                );
    }

    // =========================================================
    // PRODUCT ALREADY INACTIVE
    // =========================================================

    @ExceptionHandler(ProductAlreadyInactiveException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductAlreadyInactive(
            ProductAlreadyInactiveException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_ALREADY_INACTIVE"
                        )
                );
    }

    // =========================================================
    // PRODUCT VALIDATION
    // =========================================================

    @ExceptionHandler(ProductValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductValidation(ProductValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "PRODUCT_VALIDATION_ERROR"
                        )
                );
    }

    // =========================================================
    // BEAN VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleValidationException(
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
    // CONSTRAINT VIOLATION
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleConstraintViolation(
            ConstraintViolationException ex) {

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