package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.dto.*;
import com.nextcart.nextcart.auth_module.entity.EmailOtp;
import com.nextcart.nextcart.auth_module.entity.PasswordResetOtp;
import com.nextcart.nextcart.auth_module.entity.PendingRegistration;
import com.nextcart.nextcart.auth_module.entity.PhoneOtp;
import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import com.nextcart.nextcart.auth_module.exceptions.PendingRegistrationNotFoundException;
import com.nextcart.nextcart.auth_module.exceptions.RegistrationExpiredException;
import com.nextcart.nextcart.auth_module.exceptions.RegistrationVerificationException;
import com.nextcart.nextcart.auth_module.repository.EmailOtpRepository;
import com.nextcart.nextcart.auth_module.repository.PasswordResetOtpRepository;
import com.nextcart.nextcart.auth_module.repository.PendingRegistrationRepository;
import com.nextcart.nextcart.auth_module.repository.PhoneOtpRepository;
import com.nextcart.nextcart.auth_module.util.JwtUtil;
import com.nextcart.nextcart.seller_module.entity.Seller;
import com.nextcart.nextcart.seller_module.entity.SellerRepository;
import com.nextcart.nextcart.user_module.entity.Role;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.exception.UserAlreadyExistsException;
import com.nextcart.nextcart.user_module.repository.RoleRepository;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String CUSTOMER_ROLE = "CUSTOMER";
    private static final String SELLER_ROLE = "SELLER";

    private static final int MAX_OTP_ATTEMPTS = 5;

    private static final long OTP_EXPIRY_MINUTES = 5;
    private static final long REGISTRATION_EXPIRY_MINUTES = 15;
    private static final long RESET_TOKEN_EXPIRY_MINUTES = 10;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    private final SellerRepository sellerRepository;

    private final EmailOtpRepository emailOtpRepository;
    private final PhoneOtpRepository phoneOtpRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;

    private final EmailService emailService;
    private final SmsService smsService;

    private final SecureRandom secureRandom = new SecureRandom();


    // =========================================================
    // REGISTER CUSTOMER
    // =========================================================

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        validateRegisterRequest(request);

        String email = normalizeEmail(request.getEmail());
        String phone = normalizePhone(request.getPhone());

        /*
         * Check whether email is already registered.
         */
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new UserAlreadyExistsException(
                    "Email is already registered"
            );
        }

        /*
         * Check whether phone is already registered.
         */
        if (userRepository.existsByPhone(phone)) {
            throw new UserAlreadyExistsException(
                    "Phone number is already registered"
            );
        }

        /*
         * Make sure CUSTOMER role exists.
         */
        Role customerRole = roleRepository
                .findByNameIgnoreCase(CUSTOMER_ROLE)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "CUSTOMER role is not configured"
                        )
                );

        /*
         * Remove any previous incomplete registration
         * using the same email.
         */
        pendingRegistrationRepository
                .findByEmailIgnoreCase(email)
                .ifPresent(pendingRegistrationRepository::delete);

        /*
         * Remove any previous incomplete registration
         * using the same phone.
         */
        pendingRegistrationRepository
                .findByPhone(phone)
                .ifPresent(pendingRegistrationRepository::delete);

        /*
         * Store registration temporarily.
         *
         * IMPORTANT:
         * Never store the raw password.
         */
        PendingRegistration pendingRegistration =
                PendingRegistration.builder()
                        .firstName(request.getFirstName().trim())
                        .lastName(request.getLastName().trim())
                        .email(email)
                        .phone(phone)
                        .passwordHash(
                                passwordEncoder.encode(
                                        request.getPassword()
                                )
                        )
                        .role(customerRole.getName())
                        .emailVerified(false)
                        .phoneVerified(false)
                        .expiresAt(
                                LocalDateTime.now()
                                        .plusMinutes(
                                                REGISTRATION_EXPIRY_MINUTES
                                        )
                        )
                        .createdAt(LocalDateTime.now())
                        .build();

        pendingRegistrationRepository.save(
                pendingRegistration
        );

        /*
         * Send email OTP.
         */
        sendEmailOtp(
                SendEmailOtpRequest.builder()
                        .email(email)
                        .build()
        );

        /*
         * Send phone OTP.
         */
        sendPhoneOtp(
                SendPhoneOtpRequest.builder()
                        .phone(phone)
                        .build()
        );

        return RegisterResponse.builder()
                .firstName(pendingRegistration.getFirstName())
                .lastName(pendingRegistration.getLastName())
                .email(email)
                .phone(phone)
                .role(customerRole.getName())
                .emailOtpSent(true)
                .phoneOtpSent(true)
                .message(
                        "Registration initiated. Please verify your email and phone OTP."
                )
                .build();
    }


    // =========================================================
    // REGISTER SELLER
    // =========================================================

    @Override
    @Transactional
    public RegisterResponse registerSeller(
            SellerRegisterRequest request
    ) {

        validateSellerRegisterRequest(request);

        String email = normalizeEmail(request.getEmail());
        String phone = normalizePhone(request.getPhone());
        String gstNumber = normalizeUpperCase(
                request.getGstNumber()
        );

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new UserAlreadyExistsException(
                    "Email is already registered"
            );
        }

        if (userRepository.existsByPhone(phone)) {
            throw new UserAlreadyExistsException(
                    "Phone number is already registered"
            );
        }

        if (gstNumber != null
                && sellerRepository.existsByGstNumberIgnoreCase(
                gstNumber
        )) {

            throw new UserAlreadyExistsException(
                    "GST number is already registered"
            );
        }

        Role sellerRole = roleRepository
                .findByNameIgnoreCase(SELLER_ROLE)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "SELLER role is not configured"
                        )
                );

        User user = new User();

        user.setFirstName(
                request.getFirstName().trim()
        );

        user.setLastName(
                request.getLastName().trim()
        );

        user.setEmail(email);
        user.setPhone(phone);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(sellerRole);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        Seller seller = Seller.builder()
                .user(savedUser)
                .businessName(
                        request.getBusinessName().trim()
                )
                .gstNumber(gstNumber)
                .verified(false)
                .active(true)
                .build();

        sellerRepository.save(seller);

        return RegisterResponse.builder()
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole().getName())
                .emailOtpSent(false)
                .phoneOtpSent(false)
                .message("Seller registered successfully")
                .build();
    }


    // =========================================================
    // COMPLETE CUSTOMER REGISTRATION
    // =========================================================

    @Override
    @Transactional
    public RegisterResponse completeRegistration(
            String email,
            String phone
    ) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException(
                    "Phone number is required"
            );
        }

        String normalizedEmail = normalizeEmail(email);
        String normalizedPhone = normalizePhone(phone);

        PendingRegistration pendingRegistration =
                pendingRegistrationRepository
                        .findByEmailIgnoreCaseAndPhone(
                                normalizedEmail,
                                normalizedPhone
                        )
                        .orElseThrow(() ->
                                new PendingRegistrationNotFoundException(
                                        "Pending registration not found"
                                )
                        );

        /*
         * Check registration expiry.
         */
        if (pendingRegistration.isExpired()) {

            pendingRegistrationRepository.delete(
                    pendingRegistration
            );

            throw new RegistrationExpiredException(
                    "Registration session has expired. Please register again."
            );
        }

        /*
         * Both OTPs must be verified.
         */
        if (!pendingRegistration.isFullyVerified()) {

            throw new RegistrationVerificationException(
                    "Please verify both email and phone OTP before completing registration."
            );
        }

        /*
         * Final duplicate check.
         */
        if (userRepository.existsByEmailIgnoreCase(
                normalizedEmail
        )) {

            pendingRegistrationRepository.delete(
                    pendingRegistration
            );

            throw new UserAlreadyExistsException(
                    "Email is already registered"
            );
        }

        if (userRepository.existsByPhone(
                normalizedPhone
        )) {

            pendingRegistrationRepository.delete(
                    pendingRegistration
            );

            throw new UserAlreadyExistsException(
                    "Phone number is already registered"
            );
        }

        Role customerRole = roleRepository
                .findByNameIgnoreCase(CUSTOMER_ROLE)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "CUSTOMER role is not configured"
                        )
                );

        User user = new User();

        user.setFirstName(
                pendingRegistration.getFirstName()
        );

        user.setLastName(
                pendingRegistration.getLastName()
        );

        user.setEmail(
                pendingRegistration.getEmail()
        );

        user.setPhone(
                pendingRegistration.getPhone()
        );

        /*
         * Password is already BCrypt encoded
         * inside PendingRegistration.
         */
        user.setPassword(
                pendingRegistration.getPasswordHash()
        );

        user.setRole(customerRole);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        /*
         * Registration completed.
         */
        pendingRegistrationRepository.delete(
                pendingRegistration
        );

        return RegisterResponse.builder()
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole().getName())
                .emailOtpSent(true)
                .phoneOtpSent(true)
                .message("User registered successfully")
                .build();
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {

        validateLoginRequest(request);

        User user = findUserForLogin(request);

        if (!user.isEnabled()) {
            throw new BadCredentialsException(
                    "Invalid email/phone or password"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new BadCredentialsException(
                    "Invalid email/phone or password"
            );
        }

        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().getName()
        );

        String refreshToken =
                refreshTokenService.createRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName())
                .message("Login successful")
                .build();
    }


    // =========================================================
    // REFRESH ACCESS TOKEN
    // =========================================================

    @Override
    @Transactional
    public TokenRefreshResponse refreshAccessToken(
            RefreshTokenRequest request
    ) {

        if (request == null
                || request.getRefreshToken() == null
                || request.getRefreshToken().isBlank()) {

            throw new BadCredentialsException(
                    "Refresh token is required"
            );
        }

        String rawRefreshToken =
                request.getRefreshToken().trim();

        RefreshToken oldRefreshToken =
                refreshTokenService.validateRefreshToken(
                        rawRefreshToken
                );

        User user = oldRefreshToken.getUser();

        if (user == null || !user.isEnabled()) {
            throw new BadCredentialsException(
                    "User account is disabled"
            );
        }

        /*
         * Revoke old refresh token.
         */
        refreshTokenService.revokeToken(
                oldRefreshToken
        );

        /*
         * Generate new access token.
         */
        String newAccessToken =
                jwtUtil.generateAccessToken(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().getName()
                );

        /*
         * Generate new refresh token.
         */
        String newRefreshToken =
                refreshTokenService.createRefreshToken(user);

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .message("Token refreshed successfully")
                .build();
    }


    // =========================================================
    // LOGOUT
    // =========================================================

    @Override
    @Transactional
    public void logout(String email) {

        if (email == null || email.isBlank()) {
            throw new BadCredentialsException(
                    "Authenticated user is required"
            );
        }

        User user = userRepository
                .findByEmailIgnoreCase(email.trim())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Authenticated user not found"
                        )
                );

        refreshTokenService.revokeAllUserTokens(
                user.getId()
        );
    }


    // =========================================================
    // SEND EMAIL OTP
    // =========================================================

    @Override
    @Transactional
    public void sendEmailOtp(
            SendEmailOtpRequest request
    ) {

        if (request == null
                || request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        String email =
                normalizeEmail(request.getEmail());

        /*
         * Invalidate previous OTPs.
         */
        emailOtpRepository.deleteByEmail(email);

        String otp = generateOtp();

        EmailOtp emailOtp = EmailOtp.builder()
                .email(email)
                .otpHash(hashValue(otp))
                .expiresAt(
                        LocalDateTime.now()
                                .plusMinutes(
                                        OTP_EXPIRY_MINUTES
                                )
                )
                .attempts(0)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();

        emailOtpRepository.save(emailOtp);

        emailService.sendEmail(
                email,
                "NextCart Email Verification OTP",
                "Your NextCart verification OTP is: "
                        + otp
                        + "\n\nThis OTP is valid for 5 minutes."
        );
    }


    // =========================================================
    // VERIFY EMAIL OTP
    // =========================================================

    @Override
    @Transactional
    public void verifyEmailOtp(
            VerifyEmailOtpRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Verification request is required"
            );
        }

        String email =
                normalizeEmail(request.getEmail());

        EmailOtp emailOtp =
                emailOtpRepository
                        .findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(
                                email
                        )
                        .orElseThrow(() ->
                                new BadCredentialsException(
                                        "Invalid or expired OTP"
                                )
                        );

        validateOtpAttempts(
                emailOtp.getAttempts()
        );

        validateOtpExpiration(
                emailOtp.getExpiresAt()
        );

        if (!hashValue(request.getOtp())
                .equals(emailOtp.getOtpHash())) {

            emailOtp.setAttempts(
                    emailOtp.getAttempts() + 1
            );

            emailOtpRepository.save(emailOtp);

            throw new BadCredentialsException(
                    "Invalid OTP"
            );
        }

        /*
         * Mark email OTP as verified.
         */
        emailOtp.setVerified(true);
        emailOtp.setVerifiedAt(
                LocalDateTime.now()
        );

        emailOtpRepository.save(emailOtp);

        /*
         * Update pending registration.
         */
        PendingRegistration pendingRegistration =
                pendingRegistrationRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(() ->
                                new PendingRegistrationNotFoundException(
                                        "Pending registration not found"
                                )
                        );

        if (pendingRegistration.isExpired()) {

            pendingRegistrationRepository.delete(
                    pendingRegistration
            );

            throw new RegistrationExpiredException(
                    "Registration session has expired. Please register again."
            );
        }

        pendingRegistration.setEmailVerified(true);

        pendingRegistrationRepository.save(
                pendingRegistration
        );
    }


    // =========================================================
    // SEND PHONE OTP
    // =========================================================

    @Override
    @Transactional
    public void sendPhoneOtp(
            SendPhoneOtpRequest request
    ) {

        if (request == null
                || request.getPhone() == null
                || request.getPhone().isBlank()) {

            throw new IllegalArgumentException(
                    "Phone number is required"
            );
        }

        String phone =
                normalizePhone(request.getPhone());

        phoneOtpRepository.deleteByPhone(phone);

        String otp = generateOtp();

        PhoneOtp phoneOtp = PhoneOtp.builder()
                .phone(phone)
                .otpHash(hashValue(otp))
                .expiresAt(
                        LocalDateTime.now()
                                .plusMinutes(
                                        OTP_EXPIRY_MINUTES
                                )
                )
                .attempts(0)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();

        phoneOtpRepository.save(phoneOtp);

        smsService.sendOtp(
                phone,
                otp
        );
    }


    // =========================================================
    // VERIFY PHONE OTP
    // =========================================================

    @Override
    @Transactional
    public void verifyPhoneOtp(
            VerifyPhoneOtpRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Verification request is required"
            );
        }

        String phone =
                normalizePhone(request.getPhone());

        PhoneOtp phoneOtp =
                phoneOtpRepository
                        .findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(
                                phone
                        )
                        .orElseThrow(() ->
                                new BadCredentialsException(
                                        "Invalid or expired OTP"
                                )
                        );

        validateOtpAttempts(
                phoneOtp.getAttempts()
        );

        validateOtpExpiration(
                phoneOtp.getExpiresAt()
        );

        if (!hashValue(request.getOtp())
                .equals(phoneOtp.getOtpHash())) {

            phoneOtp.setAttempts(
                    phoneOtp.getAttempts() + 1
            );

            phoneOtpRepository.save(phoneOtp);

            throw new BadCredentialsException(
                    "Invalid OTP"
            );
        }

        /*
         * Mark phone OTP as verified.
         */
        phoneOtp.setVerified(true);
        phoneOtp.setVerifiedAt(
                LocalDateTime.now()
        );

        phoneOtpRepository.save(phoneOtp);

        /*
         * Update pending registration.
         */
        PendingRegistration pendingRegistration =
                pendingRegistrationRepository
                        .findByPhone(phone)
                        .orElseThrow(() ->
                                new PendingRegistrationNotFoundException(
                                        "Pending registration not found"
                                )
                        );

        if (pendingRegistration.isExpired()) {

            pendingRegistrationRepository.delete(
                    pendingRegistration
            );

            throw new RegistrationExpiredException(
                    "Registration session has expired. Please register again."
            );
        }

        pendingRegistration.setPhoneVerified(true);

        pendingRegistrationRepository.save(
                pendingRegistration
        );
    }


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @Override
    @Transactional
    public void forgotPassword(
            ForgotPasswordRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Forgot password request is required"
            );
        }

        boolean hasEmail =
                request.getEmail() != null
                        && !request.getEmail().isBlank();

        boolean hasPhone =
                request.getPhone() != null
                        && !request.getPhone().isBlank();

        if (!hasEmail && !hasPhone) {
            throw new IllegalArgumentException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new IllegalArgumentException(
                    "Provide either email or phone, not both"
            );
        }

        if (hasEmail) {

            String email =
                    normalizeEmail(request.getEmail());

            /*
             * Do not reveal whether account exists.
             */
            if (!userRepository.existsByEmailIgnoreCase(email)) {
                return;
            }

            passwordResetOtpRepository.deleteByEmail(
                    email
            );

            String otp = generateOtp();

            PasswordResetOtp resetOtp =
                    PasswordResetOtp.builder()
                            .email(email)
                            .otpHash(hashValue(otp))
                            .expiresAt(
                                    LocalDateTime.now()
                                            .plusMinutes(
                                                    OTP_EXPIRY_MINUTES
                                            )
                            )
                            .attempts(0)
                            .verified(false)
                            .createdAt(LocalDateTime.now())
                            .build();

            passwordResetOtpRepository.save(resetOtp);

            emailService.sendEmail(
                    email,
                    "NextCart Password Reset OTP",
                    "Your NextCart password reset OTP is: "
                            + otp
                            + "\n\nThis OTP is valid for 5 minutes."
            );

            return;
        }

        String phone =
                normalizePhone(request.getPhone());

        /*
         * Do not reveal whether account exists.
         */
        if (!userRepository.existsByPhone(phone)) {
            return;
        }

        passwordResetOtpRepository.deleteByPhone(
                phone
        );

        String otp = generateOtp();

        PasswordResetOtp resetOtp =
                PasswordResetOtp.builder()
                        .phone(phone)
                        .otpHash(hashValue(otp))
                        .expiresAt(
                                LocalDateTime.now()
                                        .plusMinutes(
                                                OTP_EXPIRY_MINUTES
                                        )
                        )
                        .attempts(0)
                        .verified(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        passwordResetOtpRepository.save(resetOtp);

        smsService.sendOtp(
                phone,
                otp
        );
    }


    // =========================================================
    // VERIFY RESET OTP
    // =========================================================

    @Override
    @Transactional
    public String verifyResetOtp(
            VerifyResetOtpRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Reset OTP request is required"
            );
        }

        boolean hasEmail =
                request.getEmail() != null
                        && !request.getEmail().isBlank();

        boolean hasPhone =
                request.getPhone() != null
                        && !request.getPhone().isBlank();

        if (!hasEmail && !hasPhone) {
            throw new IllegalArgumentException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new IllegalArgumentException(
                    "Provide either email or phone, not both"
            );
        }

        PasswordResetOtp resetOtp;

        if (hasEmail) {

            String email =
                    normalizeEmail(request.getEmail());

            resetOtp =
                    passwordResetOtpRepository
                            .findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(
                                    email
                            )
                            .orElseThrow(() ->
                                    new BadCredentialsException(
                                            "Invalid or expired OTP"
                                    )
                            );

        } else {

            String phone =
                    normalizePhone(request.getPhone());

            resetOtp =
                    passwordResetOtpRepository
                            .findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(
                                    phone
                            )
                            .orElseThrow(() ->
                                    new BadCredentialsException(
                                            "Invalid or expired OTP"
                                    )
                            );
        }

        validateOtpAttempts(
                resetOtp.getAttempts()
        );

        validateOtpExpiration(
                resetOtp.getExpiresAt()
        );

        if (!hashValue(request.getOtp())
                .equals(resetOtp.getOtpHash())) {

            resetOtp.setAttempts(
                    resetOtp.getAttempts() + 1
            );

            passwordResetOtpRepository.save(resetOtp);

            throw new BadCredentialsException(
                    "Invalid OTP"
            );
        }

        /*
         * OTP verified.
         */
        resetOtp.setVerified(true);
        resetOtp.setVerifiedAt(
                LocalDateTime.now()
        );

        /*
         * Generate short-lived reset token.
         */
        String resetToken =
                generateSecureToken();

        resetOtp.setResetTokenHash(
                hashValue(resetToken)
        );

        resetOtp.setResetTokenExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(
                                RESET_TOKEN_EXPIRY_MINUTES
                        )
        );

        passwordResetOtpRepository.save(
                resetOtp
        );

        return resetToken;
    }


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @Override
    @Transactional
    public void resetPassword(
            ResetPasswordRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Reset password request is required"
            );
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException(
                    "New password and confirm password do not match"
            );
        }

        String resetToken =
                request.getResetToken().trim();

        PasswordResetOtp resetOtp =
                passwordResetOtpRepository
                        .findByResetTokenHash(
                                hashValue(resetToken)
                        )
                        .orElseThrow(() ->
                                new BadCredentialsException(
                                        "Invalid reset token"
                                )
                        );

        if (!resetOtp.isVerified()) {
            throw new BadCredentialsException(
                    "Reset OTP has not been verified"
            );
        }

        if (resetOtp.getResetTokenExpiresAt() == null
                || resetOtp.getResetTokenExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new BadCredentialsException(
                    "Reset token has expired"
            );
        }

        User user;

        if (resetOtp.getEmail() != null
                && !resetOtp.getEmail().isBlank()) {

            user = userRepository
                    .findByEmailIgnoreCase(
                            resetOtp.getEmail()
                    )
                    .orElseThrow(() ->
                            new BadCredentialsException(
                                    "User account not found"
                            )
                    );

        } else if (resetOtp.getPhone() != null
                && !resetOtp.getPhone().isBlank()) {

            user = userRepository
                    .findByPhone(
                            resetOtp.getPhone()
                    )
                    .orElseThrow(() ->
                            new BadCredentialsException(
                                    "User account not found"
                            )
                    );

        } else {

            throw new BadCredentialsException(
                    "Invalid reset request"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        /*
         * Revoke all active sessions.
         */
        refreshTokenService.revokeAllUserTokens(
                user.getId()
        );

        /*
         * Consume reset token.
         */
        resetOtp.setResetTokenHash(null);
        resetOtp.setResetTokenExpiresAt(null);

        passwordResetOtpRepository.save(resetOtp);
    }


    // =========================================================
    // FIND USER FOR LOGIN
    // =========================================================

    private User findUserForLogin(
            LoginRequest request
    ) {

        if (request.getEmail() != null
                && !request.getEmail().isBlank()) {

            return userRepository
                    .findByEmailIgnoreCase(
                            normalizeEmail(
                                    request.getEmail()
                            )
                    )
                    .orElseThrow(() ->
                            new BadCredentialsException(
                                    "Invalid email/phone or password"
                            )
                    );
        }

        if (request.getPhone() != null
                && !request.getPhone().isBlank()) {

            return userRepository
                    .findByPhone(
                            normalizePhone(
                                    request.getPhone()
                            )
                    )
                    .orElseThrow(() ->
                            new BadCredentialsException(
                                    "Invalid email/phone or password"
                            )
                    );
        }

        throw new BadCredentialsException(
                "Email or phone is required"
        );
    }


    // =========================================================
    // VALIDATE REGISTER
    // =========================================================

    private void validateRegisterRequest(
            RegisterRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration request cannot be null"
            );
        }

        if (request.getFirstName() == null
                || request.getFirstName().isBlank()) {

            throw new IllegalArgumentException(
                    "First name is required"
            );
        }

        if (request.getLastName() == null
                || request.getLastName().isBlank()) {

            throw new IllegalArgumentException(
                    "Last name is required"
            );
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (request.getPhone() == null
                || request.getPhone().isBlank()) {

            throw new IllegalArgumentException(
                    "Phone number is required"
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }
    }


    // =========================================================
    // VALIDATE SELLER REGISTER
    // =========================================================

    private void validateSellerRegisterRequest(
            SellerRegisterRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Seller registration request cannot be null"
            );
        }

        if (request.getFirstName() == null
                || request.getFirstName().isBlank()) {

            throw new IllegalArgumentException(
                    "First name is required"
            );
        }

        if (request.getLastName() == null
                || request.getLastName().isBlank()) {

            throw new IllegalArgumentException(
                    "Last name is required"
            );
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (request.getPhone() == null
                || request.getPhone().isBlank()) {

            throw new IllegalArgumentException(
                    "Phone number is required"
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        if (request.getBusinessName() == null
                || request.getBusinessName().isBlank()) {

            throw new IllegalArgumentException(
                    "Business name is required"
            );
        }
    }


    // =========================================================
    // VALIDATE LOGIN
    // =========================================================

    private void validateLoginRequest(
            LoginRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Login request cannot be null"
            );
        }

        boolean hasEmail =
                request.getEmail() != null
                        && !request.getEmail().isBlank();

        boolean hasPhone =
                request.getPhone() != null
                        && !request.getPhone().isBlank();

        if (!hasEmail && !hasPhone) {
            throw new IllegalArgumentException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new IllegalArgumentException(
                    "Provide either email or phone, not both"
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }
    }


    // =========================================================
    // OTP VALIDATION
    // =========================================================

    private void validateOtpAttempts(
            int attempts
    ) {

        if (attempts >= MAX_OTP_ATTEMPTS) {
            throw new BadCredentialsException(
                    "Maximum OTP attempts exceeded"
            );
        }
    }


    private void validateOtpExpiration(
            LocalDateTime expiresAt
    ) {

        if (expiresAt == null
                || expiresAt.isBefore(
                LocalDateTime.now()
        )) {

            throw new BadCredentialsException(
                    "OTP has expired"
            );
        }
    }


    // =========================================================
    // GENERATE OTP
    // =========================================================

    private String generateOtp() {

        int min = 100000;
        int max = 999999;

        return String.valueOf(
                secureRandom.nextInt(
                        max - min + 1
                ) + min
        );
    }


    // =========================================================
    // GENERATE SECURE TOKEN
    // =========================================================

    private String generateSecureToken() {

        byte[] bytes = new byte[64];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }


    // =========================================================
    // HASH VALUE
    // =========================================================

    private String hashValue(
            String value
    ) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException ex) {

            throw new IllegalStateException(
                    "SHA-256 algorithm is not available",
                    ex
            );
        }
    }


    // =========================================================
    // NORMALIZE EMAIL
    // =========================================================

    private String normalizeEmail(
            String email
    ) {

        return email
                .trim()
                .toLowerCase();
    }


    // =========================================================
    // NORMALIZE PHONE
    // =========================================================

    private String normalizePhone(
            String phone
    ) {

        return phone.trim();
    }


    // =========================================================
    // NORMALIZE UPPERCASE
    // =========================================================

    private String normalizeUpperCase(
            String value
    ) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toUpperCase();
    }
}