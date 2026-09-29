package com.gesmio.havlook.seller_module.product.exceptions;

import com.gesmio.havlook.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice(
        basePackages = "com.gesmio.havlook.seller_module.product.controller"
)
public class SellerProductExceptionHandler {

    // =========================================================
    // SELLER NOT FOUND
    // =========================================================

    @ExceptionHandler(SellerNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleSellerNotFound(
            SellerNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // PRODUCT ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(SellerProductAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleProductAlreadyExists(
            SellerProductAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_PRODUCT_ALREADY_EXISTS"
                        )
                );
    }

    // =========================================================
    // PRODUCT VARIANT ALREADY EXISTS
    // =========================================================

    @ExceptionHandler(SellerProductVariantAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleVariantAlreadyExists(
            SellerProductVariantAlreadyExistsException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_PRODUCT_VARIANT_ALREADY_EXISTS"
                        )
                );
    }

    // =========================================================
    // PRODUCT VALIDATION
    // =========================================================

    @ExceptionHandler(SellerProductValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleValidation(
            SellerProductValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_PRODUCT_VALIDATION_ERROR"
                        )
                );
    }

    // =========================================================
    // PRICE ERROR
    // =========================================================

    @ExceptionHandler(SellerProductPriceException.class)
    public ResponseEntity<CommonResponseDto<Void>> handlePriceError(
            SellerProductPriceException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_PRODUCT_PRICE_ERROR"
                        )
                );
    }

    // =========================================================
    // WAREHOUSE ERROR
    // =========================================================

    @ExceptionHandler(SellerProductWarehouseException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleWarehouseError(
            SellerProductWarehouseException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_PRODUCT_WAREHOUSE_ERROR"
                        )
                );
    }

    // =========================================================
    // INVENTORY ERROR
    // =========================================================

    @ExceptionHandler(SellerProductInventoryException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInventoryError(
            SellerProductInventoryException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_PRODUCT_INVENTORY_ERROR"
                        )
                );
    }

    // =========================================================
    // IMAGE ERROR
    // =========================================================

    @ExceptionHandler(SellerProductImageException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleImageError(
            SellerProductImageException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_PRODUCT_IMAGE_ERROR"
                        )
                );
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error ->
                        error.getField() + ": " + error.getDefaultMessage()
                )
                .orElse("Request validation failed");

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
    public ResponseEntity<CommonResponseDto<Void>> handleConstraintViolation(
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
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(
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