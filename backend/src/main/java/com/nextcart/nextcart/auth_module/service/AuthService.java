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
    // CUSTOMER REGISTRATION
    // =========================================================

    RegisterResponse register(
            RegisterRequest request
    );

    RegisterResponse completeRegistration(
            String email,
            String phone
    );


    // =========================================================
    // SELLER REGISTRATION
    // =========================================================

    RegisterResponse registerSeller(
            SellerRegisterRequest request
    );

    void verifySellerEmailOtp(
            VerifyEmailOtpRequest request
    );

    void verifySellerPhoneOtpWidget(
            String phone,
            String accessToken
    );


    // =========================================================
    // LOGIN
    // =========================================================

    LoginResponse login(
            LoginRequest request
    );


    // =========================================================
    // REFRESH TOKEN
    // =========================================================

    TokenRefreshResponse refreshAccessToken(
            RefreshTokenRequest request
    );


    // =========================================================
    // LOGOUT
    // =========================================================

    void logout(
            Long userId
    );


    // =========================================================
    // CUSTOMER EMAIL OTP
    // =========================================================

    void sendEmailOtp(
            SendEmailOtpRequest request
    );

    void verifyEmailOtp(
            VerifyEmailOtpRequest request
    );


    // =========================================================
    // CUSTOMER PHONE OTP
    // =========================================================

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


    // =========================================================
    // VERIFY RESET OTP
    // =========================================================

    String verifyResetOtp(
            VerifyResetOtpRequest request
    );


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    void resetPassword(
            ResetPasswordRequest request
    );
}