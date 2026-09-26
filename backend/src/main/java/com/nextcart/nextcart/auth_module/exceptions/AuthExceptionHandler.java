package com.nextcart.nextcart.auth_module.exceptions;

import com.nextcart.nextcart.common.dto.CommonResponseDto;

import jakarta.validation.ConstraintViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice(
        basePackages = "com.nextcart.nextcart.auth_module.controller"
)
public class AuthExceptionHandler {


    // ============================================================
    // INVALID AUTH REQUEST
    // ============================================================

    @ExceptionHandler(InvalidAuthRequestException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidAuthRequest(
            InvalidAuthRequestException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }


    // ============================================================
    // INVALID CREDENTIALS
    // ============================================================

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidCredentials(
            InvalidCredentialsException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }


    // ============================================================
    // OTP VERIFICATION
    // ============================================================

    @ExceptionHandler(OtpVerificationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleOtpVerification(
            OtpVerificationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }


    // ============================================================
    // PENDING REGISTRATION NOT FOUND
    // ============================================================

    @ExceptionHandler(PendingRegistrationNotFoundException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handlePendingRegistrationNotFound(
            PendingRegistrationNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }


    // ============================================================
    // REGISTRATION EXPIRED
    // ============================================================

    @ExceptionHandler(RegistrationExpiredException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleRegistrationExpired(
            RegistrationExpiredException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }


    // ============================================================
    // REGISTRATION VERIFICATION
    // ============================================================

    @ExceptionHandler(RegistrationVerificationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleRegistrationVerification(
            RegistrationVerificationException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }


    // ============================================================
    // TOKEN EXCEPTION
    // ============================================================

    @ExceptionHandler(TokenException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleTokenException(
            TokenException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }


    // ============================================================
    // COMMON AUTH EXCEPTION
    // ============================================================

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleAuthException(
            AuthException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }


    // ============================================================
    // @VALIDATION ERRORS
    // ============================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Invalid request");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                message,
                                null
                        )
                );
    }


    // ============================================================
    // CONSTRAINT VALIDATION
    // ============================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleConstraintViolation(
            ConstraintViolationException ex) {

        String message = ex.getConstraintViolations()
                .stream()
                .findFirst()
                .map(violation -> violation.getMessage())
                .orElse("Invalid request");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                message,
                                null
                        )
                );
    }


    // ============================================================
    // INVALID JSON / REQUEST BODY
    // ============================================================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonResponseDto<Void>>
    handleInvalidJson(
            HttpMessageNotReadableException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        new CommonResponseDto<>(
                                false,
                                "Invalid request body",
                                null
                        )
                );
    }
}