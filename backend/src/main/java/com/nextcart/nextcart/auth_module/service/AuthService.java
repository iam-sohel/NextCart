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

    /**
     * Initiates customer registration.
     *
     * Exactly one identifier must be supplied:
     * - email OR phone
     *
     * Email registration:
     *      Email OTP is initiated.
     *
     * Phone registration:
     *      MSG91 Widget is used for phone verification.
     */
    RegisterResponse register(
            RegisterRequest request
    );

    /**
     * Completes customer registration after
     * the selected identifier has been verified.
     *
     * Exactly one of email or phone must be supplied.
     */
    RegisterResponse completeRegistration(
            String email,
            String phone
    );

    // =========================================================
    // SELLER REGISTRATION
    // =========================================================

    /**
     * Registers a seller account.
     */
    RegisterResponse registerSeller(
            SellerRegisterRequest request
    );

    // =========================================================
    // LOGIN
    // =========================================================

    /**
     * Authenticates a user using:
     * - email + password
     * OR
     * - phone + password
     *
     * Returns a short-lived access token and
     * a refresh token.
     */
    LoginResponse login(
            LoginRequest request
    );

    /**
     * Rotates the refresh token and generates
     * a new access token.
     */
    TokenRefreshResponse refreshAccessToken(
            RefreshTokenRequest request
    );

    /**
     * Logs out the authenticated user by revoking
     * the user's active refresh sessions.
     *
     * User identity comes from the authenticated
     * JWT/user context, not from email.
     */
    void logout(
            Long userId
    );

    // =========================================================
    // EMAIL OTP
    // =========================================================

    /**
     * Generates and sends an email verification OTP.
     */
    void sendEmailOtp(
            SendEmailOtpRequest request
    );

    /**
     * Verifies the email verification OTP.
     */
    void verifyEmailOtp(
            VerifyEmailOtpRequest request
    );

    // =========================================================
    // PHONE OTP - MSG91 WIDGET
    // =========================================================

    /**
     * Verifies phone registration using the
     * MSG91 Widget access token.
     *
     * OTP itself is handled by MSG91 Widget.
     * The backend does not generate or store
     * the widget OTP.
     */
    void verifyPhoneOtpWidget(
            String phone,
            String accessToken
    );

    // =========================================================
    // PASSWORD RESET
    // =========================================================

    /**
     * Initiates password reset using:
     * - email
     * OR
     * - phone
     *
     * The implementation should not reveal
     * whether an account exists.
     */
    void forgotPassword(
            ForgotPasswordRequest request
    );

    /**
     * Verifies the password-reset OTP and returns
     * a short-lived reset token.
     */
    String verifyResetOtp(
            VerifyResetOtpRequest request
    );

    /**
     * Changes the user's password using the
     * previously generated reset token.

     * Successful password reset must invalidate
     * existing refresh sessions.
     */
    void resetPassword(
            ResetPasswordRequest request
    );
}