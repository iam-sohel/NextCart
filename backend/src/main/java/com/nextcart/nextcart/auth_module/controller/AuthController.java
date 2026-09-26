package com.nextcart.nextcart.auth_module.controller;

import com.nextcart.nextcart.auth_module.dto.*;
import com.nextcart.nextcart.auth_module.exceptions.AuthException;
import com.nextcart.nextcart.auth_module.exceptions.InvalidAuthRequestException;
import com.nextcart.nextcart.auth_module.service.AuthService;
import com.nextcart.nextcart.common.dto.CommonResponseDto;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    // ============================================================
    // CUSTOMER REGISTRATION
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<CommonResponseDto<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        RegisterResponse response =
                authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Registration initiated successfully",
                                response
                        )
                );
    }


    // ============================================================
    // COMPLETE CUSTOMER REGISTRATION
    // ============================================================

    @PostMapping("/register/complete")
    public ResponseEntity<CommonResponseDto<RegisterResponse>>
    completeRegistration(
            @Valid @RequestBody CompleteRegistrationRequest request) {

        RegisterResponse response =
                authService.completeRegistration(
                        request.getEmail(),
                        request.getPhone()
                );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Registration completed successfully",
                        response
                )
        );
    }


    // ============================================================
    // SELLER REGISTRATION
    // ============================================================

    @PostMapping("/register/seller")
    public ResponseEntity<CommonResponseDto<RegisterResponse>>
    registerSeller(
            @Valid @RequestBody SellerRegisterRequest request) {

        RegisterResponse response =
                authService.registerSeller(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new CommonResponseDto<>(
                                true,
                                "Seller registration initiated successfully",
                                response
                        )
                );
    }


    // ============================================================
    // SELLER EMAIL OTP - VERIFY
    // ============================================================

    @PostMapping("/verify-seller-email-otp")
    public ResponseEntity<CommonResponseDto<Void>>
    verifySellerEmailOtp(
            @Valid @RequestBody VerifyEmailOtpRequest request) {

        authService.verifySellerEmailOtp(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller email OTP verified successfully",
                        null
                )
        );
    }


    // ============================================================
    // SELLER PHONE OTP - MSG91 WIDGET
    // ============================================================

    @PostMapping("/verify-seller-phone-otp")
    public ResponseEntity<CommonResponseDto<Void>>
    verifySellerPhoneOtp(
            @Valid @RequestBody VerifyPhoneWidgetRequest request) {

        authService.verifySellerPhoneOtpWidget(
                request.getPhone(),
                request.getAccessToken()
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Seller phone OTP verified successfully",
                        null
                )
        );
    }


    // ============================================================
    // LOGIN - COMMON / LEGACY
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<CommonResponseDto<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response =
                authService.login(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Login successful",
                        response
                )
        );
    }


    // ============================================================
    // CUSTOMER LOGIN
    // ============================================================

    @PostMapping("/customer/login")
    public ResponseEntity<CommonResponseDto<LoginResponse>>
    customerLogin(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response =
                authService.customerLogin(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Customer login successful",
                        response
                )
        );
    }


    // ============================================================
    // ADMIN LOGIN
    // ============================================================

    @PostMapping("/admin/login")
    public ResponseEntity<CommonResponseDto<LoginResponse>>
    adminLogin(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response =
                authService.adminLogin(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Admin login successful",
                        response
                )
        );
    }


    // ============================================================
    // REFRESH TOKEN
    // ============================================================

    @PostMapping("/refresh")
    public ResponseEntity<CommonResponseDto<TokenRefreshResponse>>
    refreshAccessToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        TokenRefreshResponse response =
                authService.refreshAccessToken(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Token refreshed successfully",
                        response
                )
        );
    }


    // ============================================================
    // LOGOUT
    // ============================================================

    @PostMapping("/logout")
    public ResponseEntity<CommonResponseDto<Void>> logout(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Authenticated user is required"
            );
        }

        final Long userId;

        try {

            userId = Long.valueOf(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            throw new AuthException(
                    "Invalid authenticated user",
                    ex
            );
        }

        authService.logout(userId);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Logout successful",
                        null
                )
        );
    }


    // ============================================================
    // EMAIL OTP - SEND
    // ============================================================

    @PostMapping("/email/send-otp")
    public ResponseEntity<CommonResponseDto<Void>>
    sendEmailOtp(
            @Valid @RequestBody SendEmailOtpRequest request) {

        authService.sendEmailOtp(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Email OTP sent successfully",
                        null
                )
        );
    }


    // ============================================================
    // EMAIL OTP - VERIFY
    // ============================================================

    @PostMapping("/email/verify-otp")
    public ResponseEntity<CommonResponseDto<Void>>
    verifyEmailOtp(
            @Valid @RequestBody VerifyEmailOtpRequest request) {

        authService.verifyEmailOtp(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Email OTP verified successfully",
                        null
                )
        );
    }


    // ============================================================
    // PHONE OTP - MSG91 WIDGET
    // ============================================================

    @PostMapping("/phone/verify-widget")
    public ResponseEntity<CommonResponseDto<Void>>
    verifyPhoneOtpWidget(
            @Valid @RequestBody VerifyPhoneWidgetRequest request) {

        authService.verifyPhoneOtpWidget(
                request.getPhone(),
                request.getAccessToken()
        );

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Phone OTP verified successfully",
                        null
                )
        );
    }


    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<CommonResponseDto<Void>>
    forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "If the account exists, a password reset OTP has been sent",
                        null
                )
        );
    }


    // ============================================================
    // VERIFY RESET OTP
    // ============================================================

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<CommonResponseDto<Map<String, String>>>
    verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {

        String resetToken =
                authService.verifyResetOtp(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "OTP verified successfully",
                        Map.of(
                                "resetToken",
                                resetToken
                        )
                )
        );
    }


    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @PostMapping("/reset-password")
    public ResponseEntity<CommonResponseDto<Void>>
    resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return ResponseEntity.ok(
                new CommonResponseDto<>(
                        true,
                        "Password reset successfully",
                        null
                )
        );
    }
}