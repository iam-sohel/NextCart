package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.dto.ForgotPasswordRequest;
import com.nextcart.nextcart.auth_module.dto.LoginRequest;
import com.nextcart.nextcart.auth_module.dto.LoginResponse;
import com.nextcart.nextcart.auth_module.dto.RefreshTokenRequest;
import com.nextcart.nextcart.auth_module.dto.RegisterRequest;
import com.nextcart.nextcart.auth_module.dto.RegisterResponse;
import com.nextcart.nextcart.auth_module.dto.ResetPasswordRequest;
import com.nextcart.nextcart.auth_module.dto.SellerRegisterRequest;
import com.nextcart.nextcart.auth_module.dto.SendEmailOtpRequest;
import com.nextcart.nextcart.auth_module.dto.TokenRefreshResponse;
import com.nextcart.nextcart.auth_module.dto.VerifyEmailOtpRequest;
import com.nextcart.nextcart.auth_module.dto.VerifyResetOtpRequest;

public interface AuthService {

    // =========================================================
    // REGISTRATION
    // =========================================================

    RegisterResponse register(RegisterRequest request);

    RegisterResponse registerSeller(SellerRegisterRequest request);

    RegisterResponse completeRegistration(
            String email,
            String phone
    );

    // =========================================================
    // LOGIN
    // =========================================================

    LoginResponse login(LoginRequest request);

    TokenRefreshResponse refreshAccessToken(
            RefreshTokenRequest request
    );

    void logout(String email);

    // =========================================================
    // EMAIL OTP
    // =========================================================

    void sendEmailOtp(
            SendEmailOtpRequest request
    );

    void verifyEmailOtp(
            VerifyEmailOtpRequest request
    );

    // =========================================================
    // PHONE OTP - MSG91 WIDGET
    // =========================================================

    /**
     * Verify phone registration using
     * MSG91 Widget access token.
     *
     * The frontend completes OTP verification
     * through MSG91 Widget and sends the resulting
     * access token to the backend.
     */
    void verifyPhoneOtpWidget(
            String phone,
            String accessToken
    );

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    void forgotPassword(
            ForgotPasswordRequest request
    );

    String verifyResetOtp(
            VerifyResetOtpRequest request
    );

    void resetPassword(
            ResetPasswordRequest request
    );
}