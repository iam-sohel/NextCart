package com.nextcart.nextcart.auth_module.controller;

import com.nextcart.nextcart.auth_module.dto.*;
import com.nextcart.nextcart.auth_module.service.AuthService;
import com.nextcart.nextcart.common.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        RegisterResponse response =
                authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<RegisterResponse>>
    completeRegistration(
            @Valid @RequestBody CompleteRegistrationRequest request) {

        RegisterResponse response =
                authService.completeRegistration(
                        request.getEmail(),
                        request.getPhone()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<RegisterResponse>>
    registerSeller(
            @Valid @RequestBody SellerRegisterRequest request) {

        RegisterResponse response =
                authService.registerSeller(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Seller registered successfully",
                                response
                        )
                );
    }


    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response =
                authService.login(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Login successful",
                        response
                )
        );
    }


    // ============================================================
    // REFRESH TOKEN
    // ============================================================

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>>
    refreshAccessToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        TokenRefreshResponse response =
                authService.refreshAccessToken(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>> logout(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Authenticated user is required",
                                    null
                            )
                    );
        }

        final Long userId;

        try {

            userId = Long.valueOf(
                    authentication.getName()
            );

        } catch (NumberFormatException ex) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Invalid authenticated user",
                                    null
                            )
                    );
        }

        authService.logout(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>>
    sendEmailOtp(
            @Valid @RequestBody SendEmailOtpRequest request) {

        authService.sendEmailOtp(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>>
    verifyEmailOtp(
            @Valid @RequestBody VerifyEmailOtpRequest request) {

        authService.verifyEmailOtp(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>>
    verifyPhoneOtpWidget(
            @Valid @RequestBody VerifyPhoneWidgetRequest request) {

        authService.verifyPhoneOtpWidget(
                request.getPhone(),
                request.getAccessToken()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>>
    forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Map<String, String>>>
    verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {

        String resetToken =
                authService.verifyResetOtp(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
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
    public ResponseEntity<ApiResponse<Void>>
    resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Password reset successfully",
                        null
                )
        );
    }
}