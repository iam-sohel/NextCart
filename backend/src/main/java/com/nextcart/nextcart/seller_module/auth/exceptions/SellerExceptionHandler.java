package com.nextcart.nextcart.seller_module.auth.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.seller_module"
)
public class SellerExceptionHandler {

    // =========================================================
    // SELLER NOT FOUND / NOT A SELLER
    // =========================================================

    @ExceptionHandler(SellerNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleSellerNotFound(
            SellerNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
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
    // SELLER INACTIVE
    // =========================================================

    @ExceptionHandler(SellerInactiveException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleSellerInactive(
            SellerInactiveException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null,
                                "SELLER_INACTIVE"
                        )
                );
    }
}