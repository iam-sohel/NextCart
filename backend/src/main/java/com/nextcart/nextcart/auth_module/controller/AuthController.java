package com.nextcart.nextcart.auth_module.controller;

import com.nextcart.nextcart.auth_module.dto.*;
import com.nextcart.nextcart.auth_module.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    /**
     * Complete customer registration after
     * both email and phone OTPs are verified.
     */
    @PostMapping("/register/complete")
    public ResponseEntity<RegisterResponse> completeRegistration(
            @Valid @RequestBody CompleteRegistrationRequest request) {

        return ResponseEntity.ok(
                authService.completeRegistration(
                        request.getEmail(),
                        request.getPhone()
                )
        );
    }

    // ============================================================
    // SELLER REGISTRATION
    // ============================================================

    @PostMapping("/register/seller")
    public ResponseEntity<RegisterResponse> registerSeller(
            @Valid @RequestBody SellerRegisterRequest request) {

        return ResponseEntity.ok(
                authService.registerSeller(request)
        );
    }

    // ============================================================
    // LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    // ============================================================
    // REFRESH TOKEN
    // ============================================================

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshAccessToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        return ResponseEntity.ok(
                authService.refreshAccessToken(request)
        );
    }

    // ============================================================
    // LOGOUT
    // ============================================================

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            Authentication authentication) {

        authService.logout(authentication.getName());

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // EMAIL OTP
    // ============================================================

    @PostMapping("/email/send-otp")
    public ResponseEntity<Void> sendEmailOtp(
            @Valid @RequestBody SendEmailOtpRequest request) {

        authService.sendEmailOtp(request);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/email/verify-otp")
    public ResponseEntity<Void> verifyEmailOtp(
            @Valid @RequestBody VerifyEmailOtpRequest request) {

        authService.verifyEmailOtp(request);

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // PHONE OTP
    // ============================================================

    @PostMapping("/phone/send-otp")
    public ResponseEntity<Void> sendPhoneOtp(
            @Valid @RequestBody SendPhoneOtpRequest request) {

        authService.sendPhoneOtp(request);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/phone/verify-otp")
    public ResponseEntity<Void> verifyPhoneOtp(
            @Valid @RequestBody VerifyPhoneOtpRequest request) {

        authService.verifyPhoneOtp(request);

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request);

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // VERIFY RESET OTP
    // ============================================================

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, String>> verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {

        String resetToken = authService.verifyResetOtp(request);

        return ResponseEntity.ok(
                Map.of(
                        "resetToken", resetToken,
                        "message", "OTP verified successfully"
                )
        );
    }

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return ResponseEntity.noContent().build();
    }
}