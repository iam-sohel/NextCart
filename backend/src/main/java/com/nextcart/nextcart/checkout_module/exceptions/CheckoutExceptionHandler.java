package com.nextcart.nextcart.checkout_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.checkout_module.controller"
)
public class CheckoutExceptionHandler {

    @ExceptionHandler(CheckoutCustomerNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCustomerNotFound(
            CheckoutCustomerNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_CUSTOMER_NOT_FOUND"
                ));
    }

    @ExceptionHandler(CheckoutShippingAddressNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleShippingAddressNotFound(
            CheckoutShippingAddressNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_SHIPPING_ADDRESS_NOT_FOUND"
                ));
    }

    @ExceptionHandler(CheckoutCouponNotAvailableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCouponNotAvailable(
            CheckoutCouponNotAvailableException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_COUPON_NOT_AVAILABLE"
                ));
    }

    @ExceptionHandler(CheckoutCartNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCartNotFound(
            CheckoutCartNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_CART_NOT_FOUND"
                ));
    }

    @ExceptionHandler(CheckoutCartEmptyException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCartEmpty(
            CheckoutCartEmptyException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_CART_EMPTY"
                ));
    }

    @ExceptionHandler(CheckoutInventoryNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInventoryNotFound(
            CheckoutInventoryNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_INVENTORY_NOT_FOUND"
                ));
    }

    @ExceptionHandler(CheckoutStockException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleStockException(
            CheckoutStockException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_STOCK_ERROR"
                ));
    }

    @ExceptionHandler(CheckoutPriceNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handlePriceNotFound(
            CheckoutPriceNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_PRICE_NOT_FOUND"
                ));
    }

    @ExceptionHandler(CheckoutPriceException.class)
    public ResponseEntity<CommonResponseDto<Void>> handlePriceException(
            CheckoutPriceException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_PRICE_ERROR"
                ));
    }

    @ExceptionHandler(CheckoutProductVariantNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleProductVariantNotFound(
            CheckoutProductVariantNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_PRODUCT_VARIANT_NOT_FOUND"
                ));
    }

    @ExceptionHandler(CheckoutCartItemException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCartItemException(
            CheckoutCartItemException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_CART_ITEM_ERROR"
                ));
    }

    @ExceptionHandler(CheckoutBillingAddressException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleBillingAddressException(
            CheckoutBillingAddressException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_BILLING_ADDRESS_ERROR"
                ));
    }

    @ExceptionHandler(CheckoutUserNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleUserNotFound(
            CheckoutUserNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_USER_NOT_FOUND"
                ));
    }

    @ExceptionHandler(CheckoutValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleCheckoutValidation(
            CheckoutValidationException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "CHECKOUT_VALIDATION_ERROR"
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleValidation(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Validation failed");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "VALIDATION_ERROR"
                ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        "Invalid request body",
                        null,
                        "INVALID_REQUEST_BODY"
                ));
    }
}