package com.nextcart.nextcart.seller_module.order_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.order_module.exceptions.InvalidOrderStatusException;
import com.nextcart.nextcart.order_module.exceptions.OrderNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.seller_module.order_module"
)
public class SellerOrderExceptionHandler {

    // =========================================================
    // SELLER ORDER VALIDATION
    // =========================================================

    @ExceptionHandler(SellerOrderValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleValidation(
            SellerOrderValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "SELLER_ORDER_VALIDATION_ERROR"
                ));
    }


    // =========================================================
    // SELLER ORDER DATA ERROR
    // =========================================================

    @ExceptionHandler(SellerOrderDataException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleDataError(
            SellerOrderDataException ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "SELLER_ORDER_DATA_ERROR"
                ));
    }


    // =========================================================
    // ORDER NOT FOUND
    // =========================================================

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleOrderNotFound(
            OrderNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "ORDER_NOT_FOUND"
                ));
    }


    // =========================================================
    // INVALID ORDER STATUS
    // =========================================================

    @ExceptionHandler(InvalidOrderStatusException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidOrderStatus(
            InvalidOrderStatusException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        ex.getMessage(),
                        null,
                        "INVALID_ORDER_STATUS"
                ));
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
                .orElse("Invalid request");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        message,
                        null,
                        "VALIDATION_ERROR"
                ));
    }


    // =========================================================
    // INVALID REQUEST BODY
    // =========================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new CommonResponseDto<>(
                        false,
                        "Invalid request body",
                        null,
                        "INVALID_REQUEST_BODY"
                ));
    }
}