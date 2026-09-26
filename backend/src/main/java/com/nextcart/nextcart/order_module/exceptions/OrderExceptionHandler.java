package com.nextcart.nextcart.order_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;
import com.nextcart.nextcart.order_module.exceptions.InvalidOrderStatusException;
import com.nextcart.nextcart.order_module.exceptions.OrderCancellationException;
import com.nextcart.nextcart.order_module.exceptions.OrderNotFoundException;
import com.nextcart.nextcart.order_module.exceptions.OrderValidationException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.order_module"
)
public class OrderExceptionHandler {

    // =========================================================
    // ORDER NOT FOUND
    // =========================================================

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleOrderNotFound(
            OrderNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ORDER_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // INVALID ORDER STATUS
    // =========================================================

    @ExceptionHandler(InvalidOrderStatusException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidOrderStatus(
            InvalidOrderStatusException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "INVALID_ORDER_STATUS"
                        )
                );
    }

    // =========================================================
    // ORDER CANCELLATION
    // =========================================================

    @ExceptionHandler(OrderCancellationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleOrderCancellation(
            OrderCancellationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ORDER_CANCELLATION_ERROR"
                        )
                );
    }

    // =========================================================
    // ORDER VALIDATION
    // =========================================================

    @ExceptionHandler(OrderValidationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleOrderValidation(
            OrderValidationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "ORDER_VALIDATION_ERROR"
                        )
                );
    }

    // =========================================================
    // REQUEST VALIDATION
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
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