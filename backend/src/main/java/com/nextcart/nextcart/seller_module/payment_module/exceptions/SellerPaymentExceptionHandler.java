package com.nextcart.nextcart.seller_module.payment_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages =
                "com.nextcart.nextcart.seller_module.payment_module.controller"
)
public class SellerPaymentExceptionHandler {

    // =========================================================
    // INVALID ID
    // =========================================================

    @ExceptionHandler(InvalidIdException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidId(
            InvalidIdException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "INVALID_ID"
                        )
                );
    }

    // =========================================================
    // INVALID ORDER
    // =========================================================

    @ExceptionHandler(InvalidOrderException.class)
    public ResponseEntity<CommonResponseDto<Void>> handleInvalidOrder(
            InvalidOrderException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "INVALID_ORDER"
                        )
                );
    }

    // =========================================================
    // INVALID ORDER ITEM
    // =========================================================

    @ExceptionHandler(InvalidOrderItemException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidOrderItem(
            InvalidOrderItemException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "INVALID_ORDER_ITEM"
                        )
                );
    }

    // =========================================================
    // SELLER EARNING NOT FOUND
    // =========================================================

    @ExceptionHandler(SellerEarningNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleSellerEarningNotFound(
            SellerEarningNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_EARNING_NOT_FOUND"
                        )
                );
    }

    // =========================================================
    // SELLER EARNING CREATION FAILED
    // =========================================================

    @ExceptionHandler(SellerEarningCreationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleSellerEarningCreation(
            SellerEarningCreationException ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_EARNING_CREATION_FAILED"
                        )
                );
    }

    // =========================================================
    // INVALID EARNING STATUS
    // =========================================================

    @ExceptionHandler(InvalidEarningStatusException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidEarningStatus(
            InvalidEarningStatusException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "INVALID_EARNING_STATUS"
                        )
                );
    }
}