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
import com.nextcart.nextcart.auth_module.dto.SendPhoneOtpRequest;
import com.nextcart.nextcart.auth_module.dto.TokenRefreshResponse;
import com.nextcart.nextcart.auth_module.dto.VerifyEmailOtpRequest;
import com.nextcart.nextcart.auth_module.dto.VerifyPhoneOtpRequest;
import com.nextcart.nextcart.auth_module.dto.VerifyResetOtpRequest;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    RegisterResponse registerSeller(SellerRegisterRequest request);

    LoginResponse login(LoginRequest request);

    TokenRefreshResponse refreshAccessToken(RefreshTokenRequest request);

    void logout(String email);

    void sendEmailOtp(SendEmailOtpRequest request);

    void verifyEmailOtp(VerifyEmailOtpRequest request);

    void sendPhoneOtp(SendPhoneOtpRequest request);

    void verifyPhoneOtp(VerifyPhoneOtpRequest request);

    /*
     * Complete customer registration only after
     * email and phone OTP verification.
     */
    RegisterResponse completeRegistration(String email, String phone);

    void forgotPassword(ForgotPasswordRequest request);

    String verifyResetOtp(VerifyResetOtpRequest request);

    void resetPassword(ResetPasswordRequest request);
}