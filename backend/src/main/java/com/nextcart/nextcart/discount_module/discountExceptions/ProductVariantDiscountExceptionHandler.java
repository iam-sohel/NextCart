package com.nextcart.nextcart.discount_module.discountExceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.discount_module"
)
public class ProductVariantDiscountExceptionHandler {

    @ExceptionHandler(ProductVariantDiscountNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleDiscountNotFound(
            ProductVariantDiscountNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "PRODUCT_VARIANT_DISCOUNT_NOT_FOUND"
                )
        );
    }

    @ExceptionHandler(ProductVariantDiscountAlreadyExistsException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleDiscountAlreadyExists(
            ProductVariantDiscountAlreadyExistsException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "PRODUCT_VARIANT_DISCOUNT_ALREADY_EXISTS"
                )
        );
    }

    @ExceptionHandler(ProductVariantNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleProductVariantNotFound(
            ProductVariantNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "PRODUCT_VARIANT_NOT_FOUND"
                )
        );
    }

    @ExceptionHandler(ProductVariantPriceNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleProductVariantPriceNotFound(
            ProductVariantPriceNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "PRODUCT_VARIANT_PRICE_NOT_FOUND"
                )
        );
    }

    @ExceptionHandler(InvalidDiscountException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidDiscount(
            InvalidDiscountException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "INVALID_DISCOUNT"
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
    public ResponseEntity<CommonResponseDto<Void>>
    handleConstraintViolation(
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
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidRequestBody(
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