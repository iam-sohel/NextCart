package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.dto.*;
import com.nextcart.nextcart.auth_module.entity.EmailOtp;
import com.nextcart.nextcart.auth_module.entity.PasswordResetOtp;
import com.nextcart.nextcart.auth_module.entity.PendingRegistration;
import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import com.nextcart.nextcart.auth_module.exceptions.InvalidAuthRequestException;
import com.nextcart.nextcart.auth_module.exceptions.InvalidCredentialsException;
import com.nextcart.nextcart.auth_module.exceptions.OtpVerificationException;
import com.nextcart.nextcart.auth_module.exceptions.PendingRegistrationNotFoundException;
import com.nextcart.nextcart.auth_module.exceptions.RegistrationExpiredException;
import com.nextcart.nextcart.auth_module.exceptions.RegistrationVerificationException;
import com.nextcart.nextcart.auth_module.exceptions.TokenException;
import com.nextcart.nextcart.auth_module.repository.EmailOtpRepository;
import com.nextcart.nextcart.auth_module.repository.PasswordResetOtpRepository;
import com.nextcart.nextcart.auth_module.repository.PendingRegistrationRepository;
import com.nextcart.nextcart.auth_module.repository.PhoneOtpRepository;
import com.nextcart.nextcart.auth_module.util.JwtUtil;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.user_module.entity.Role;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.exception.UserAlreadyExistsException;
import com.nextcart.nextcart.user_module.repository.RoleRepository;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    private final SellerRepository sellerRepository;

    private final EmailOtpRepository emailOtpRepository;
    private final PhoneOtpRepository phoneOtpRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;

    private final EmailService emailService;
    private final SmsService smsService;
    private final Msg91WidgetService msg91WidgetService;

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

        boolean hasEmail = email != null && !email.isBlank();
        boolean hasPhone = phone != null && !phone.isBlank();

        if (!hasEmail && !hasPhone) {
            throw new InvalidAuthRequestException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new InvalidAuthRequestException(
                    "Provide either email or phone, not both"
            );
        }

        if (hasEmail &&
                userRepository.existsByEmailIgnoreCase(email)) {

            throw new UserAlreadyExistsException(
                    "Email is already registered"
            );
        }

        if (hasPhone &&
                userRepository.existsByPhone(phone)) {

            throw new UserAlreadyExistsException(
                    "Phone number is already registered"
            );
        }

        Role customerRole = roleRepository
                .findByNameIgnoreCase(CUSTOMER_ROLE)
                .orElseThrow(() ->
                        new InvalidAuthRequestException(
                                "CUSTOMER role is not configured"
                        )
                );

        if (hasEmail) {
            pendingRegistrationRepository
                    .findByEmailIgnoreCase(email)
                    .ifPresent(pendingRegistrationRepository::delete);
        }

        if (hasPhone) {
            pendingRegistrationRepository
                    .findByPhone(phone)
                    .ifPresent(pendingRegistrationRepository::delete);
        }

        PendingRegistration pendingRegistration =
                PendingRegistration.builder()
                        .firstName(request.getFirstName().trim())
                        .lastName(request.getLastName().trim())
                        .email(hasEmail ? email : null)
                        .phone(hasPhone ? phone : null)
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

        if (hasEmail) {

            sendEmailOtp(
                    SendEmailOtpRequest.builder()
                            .email(email)
                            .build()
            );

            return RegisterResponse.builder()
                    .firstName(pendingRegistration.getFirstName())
                    .lastName(pendingRegistration.getLastName())
                    .email(email)
                    .phone(null)
                    .role(customerRole.getName())
                    .emailOtpSent(true)
                    .phoneOtpSent(false)
                    .message(
                            "Registration initiated. Please verify your email OTP."
                    )
                    .build();
        }

        return RegisterResponse.builder()
                .firstName(pendingRegistration.getFirstName())
                .lastName(pendingRegistration.getLastName())
                .email(null)
                .phone(phone)
                .role(customerRole.getName())
                .emailOtpSent(false)
                .phoneOtpSent(true)
                .message(
                        "Registration initiated. Please verify your phone number using the OTP widget."
                )
                .build();
    }


    // =========================================================
    // REGISTER SELLER
    // =========================================================

    @Override
    @Transactional
    public RegisterResponse registerSeller(
            SellerRegisterRequest request) {

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

        if (gstNumber != null &&
                sellerRepository.existsByGstNumberIgnoreCase(gstNumber)) {

            throw new UserAlreadyExistsException(
                    "GST number is already registered"
            );
        }

        Role sellerRole = roleRepository
                .findByNameIgnoreCase(SELLER_ROLE)
                .orElseThrow(() ->
                        new InvalidAuthRequestException(
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
            String phone) {

        boolean hasEmail =
                email != null && !email.isBlank();

        boolean hasPhone =
                phone != null && !phone.isBlank();

        if (!hasEmail && !hasPhone) {
            throw new InvalidAuthRequestException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new InvalidAuthRequestException(
                    "Provide either email or phone, not both"
            );
        }

        String normalizedEmail =
                hasEmail ? normalizeEmail(email) : null;

        String normalizedPhone =
                hasPhone ? normalizePhone(phone) : null;

        PendingRegistration pendingRegistration;

        if (hasEmail) {

            pendingRegistration =
                    pendingRegistrationRepository
                            .findByEmailIgnoreCase(
                                    normalizedEmail
                            )
                            .orElseThrow(() ->
                                    new PendingRegistrationNotFoundException(
                                            "Pending registration not found"
                                    )
                            );

        } else {

            pendingRegistration =
                    pendingRegistrationRepository
                            .findByPhone(normalizedPhone)
                            .orElseThrow(() ->
                                    new PendingRegistrationNotFoundException(
                                            "Pending registration not found"
                                    )
                            );
        }

        if (pendingRegistration.isExpired()) {

            pendingRegistrationRepository.delete(
                    pendingRegistration
            );

            throw new RegistrationExpiredException(
                    "Registration session has expired. Please register again."
            );
        }

        if (hasEmail &&
                !pendingRegistration.isEmailVerified()) {

            throw new RegistrationVerificationException(
                    "Please verify your email OTP before completing registration."
            );
        }

        if (hasPhone &&
                !pendingRegistration.isPhoneVerified()) {

            throw new RegistrationVerificationException(
                    "Please verify your phone OTP before completing registration."
            );
        }

        if (hasEmail &&
                userRepository.existsByEmailIgnoreCase(
                        normalizedEmail
                )) {

            pendingRegistrationRepository.delete(
                    pendingRegistration
            );

            throw new UserAlreadyExistsException(
                    "Email is already registered"
            );
        }

        if (hasPhone &&
                userRepository.existsByPhone(
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
                        new InvalidAuthRequestException(
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

        user.setPassword(
                pendingRegistration.getPasswordHash()
        );

        user.setRole(customerRole);
        user.setEnabled(true);

        User savedUser =
                userRepository.save(user);

        pendingRegistrationRepository.delete(
                pendingRegistration
        );

        return RegisterResponse.builder()
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole().getName())
                .emailOtpSent(savedUser.getEmail() != null)
                .phoneOtpSent(savedUser.getPhone() != null)
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
            throw new InvalidCredentialsException(
                    "Invalid email/phone or password"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException(
                    "Invalid email/phone or password"
            );
        }

        String accessToken =
                jwtUtil.generateAccessToken(
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
            RefreshTokenRequest request) {

        if (request == null ||
                request.getRefreshToken() == null ||
                request.getRefreshToken().isBlank()) {

            throw new TokenException(
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
            throw new TokenException(
                    "User account is disabled"
            );
        }

        refreshTokenService.revokeToken(
                oldRefreshToken
        );

        String newAccessToken =
                jwtUtil.generateAccessToken(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().getName()
                );

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
    public void logout(Long userId) {

        if (userId == null) {
            throw new InvalidAuthRequestException(
                    "Authenticated user is required"
            );
        }

        refreshTokenService.revokeAllUserTokens(userId);
    }
    // =========================================================
    // SEND EMAIL OTP
    // =========================================================

    @Override
    @Transactional
    public void sendEmailOtp(
            SendEmailOtpRequest request) {

        if (request == null ||
                request.getEmail() == null ||
                request.getEmail().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Email is required"
            );
        }

        String email =
                normalizeEmail(request.getEmail());

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
            VerifyEmailOtpRequest request) {

        if (request == null) {
            throw new InvalidAuthRequestException(
                    "Verification request is required"
            );
        }

        String email =
                normalizeEmail(request.getEmail());

        EmailOtp emailOtp =
                emailOtpRepository
                        .findTopByEmailIgnoreCaseAndVerifiedFalseOrderByCreatedAtDesc(
                                email
                        )
                        .orElseThrow(() ->
                                new OtpVerificationException(
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

            throw new OtpVerificationException(
                    "Invalid OTP"
            );
        }

        emailOtp.setVerified(true);
        emailOtp.setVerifiedAt(
                LocalDateTime.now()
        );

        emailOtpRepository.save(emailOtp);

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
    // VERIFY PHONE OTP USING MSG91 WIDGET
    // =========================================================

    @Override
    @Transactional
    public void verifyPhoneOtpWidget(
            String phone,
            String accessToken) {

        if (phone == null || phone.isBlank()) {
            throw new InvalidAuthRequestException(
                    "Phone number is required"
            );
        }

        if (accessToken == null || accessToken.isBlank()) {
            throw new InvalidAuthRequestException(
                    "MSG91 access token is required"
            );
        }

        String normalizedPhone =
                normalizePhone(phone);

        PendingRegistration pendingRegistration =
                pendingRegistrationRepository
                        .findByPhone(normalizedPhone)
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

        boolean verified =
                msg91WidgetService.verifyAccessToken(
                        accessToken.trim()
                );

        if (!verified) {
            throw new OtpVerificationException(
                    "Phone OTP verification failed"
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
            ForgotPasswordRequest request) {

        if (request == null) {
            throw new InvalidAuthRequestException(
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
            throw new InvalidAuthRequestException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new InvalidAuthRequestException(
                    "Provide either email or phone, not both"
            );
        }

        if (hasEmail) {

            String email =
                    normalizeEmail(request.getEmail());

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
            VerifyResetOtpRequest request) {

        if (request == null) {
            throw new InvalidAuthRequestException(
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
            throw new InvalidAuthRequestException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new InvalidAuthRequestException(
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
                                    new OtpVerificationException(
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
                                    new OtpVerificationException(
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

            throw new OtpVerificationException(
                    "Invalid OTP"
            );
        }

        resetOtp.setVerified(true);
        resetOtp.setVerifiedAt(
                LocalDateTime.now()
        );

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
            ResetPasswordRequest request) {

        if (request == null) {
            throw new InvalidAuthRequestException(
                    "Reset password request is required"
            );
        }

        if (request.getNewPassword() == null ||
                request.getConfirmPassword() == null) {

            throw new InvalidAuthRequestException(
                    "New password and confirm password are required"
            );
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new InvalidAuthRequestException(
                    "New password and confirm password do not match"
            );
        }

        if (request.getResetToken() == null ||
                request.getResetToken().isBlank()) {

            throw new TokenException(
                    "Reset token is required"
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
                                new TokenException(
                                        "Invalid reset token"
                                )
                        );

        if (!resetOtp.isVerified()) {
            throw new TokenException(
                    "Reset OTP has not been verified"
            );
        }

        if (resetOtp.getResetTokenExpiresAt() == null
                || resetOtp.getResetTokenExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new TokenException(
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
                            new TokenException(
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
                            new TokenException(
                                    "User account not found"
                            )
                    );

        } else {

            throw new InvalidAuthRequestException(
                    "Invalid reset request"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        refreshTokenService.revokeAllUserTokens(
                user.getId()
        );

        resetOtp.setResetTokenHash(null);
        resetOtp.setResetTokenExpiresAt(null);

        passwordResetOtpRepository.save(resetOtp);
    }


    // =========================================================
    // FIND USER FOR LOGIN
    // =========================================================

    private User findUserForLogin(
            LoginRequest request) {

        if (request.getEmail() != null
                && !request.getEmail().isBlank()) {

            return userRepository
                    .findByEmailIgnoreCase(
                            normalizeEmail(
                                    request.getEmail()
                            )
                    )
                    .orElseThrow(() ->
                            new InvalidCredentialsException(
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
                            new InvalidCredentialsException(
                                    "Invalid email/phone or password"
                            )
                    );
        }

        throw new InvalidAuthRequestException(
                "Email or phone is required"
        );
    }


    // =========================================================
    // VALIDATE REGISTER
    // =========================================================

    private void validateRegisterRequest(
            RegisterRequest request) {

        if (request == null) {
            throw new InvalidAuthRequestException(
                    "Registration request cannot be null"
            );
        }

        if (request.getFirstName() == null
                || request.getFirstName().isBlank()) {

            throw new InvalidAuthRequestException(
                    "First name is required"
            );
        }

        if (request.getLastName() == null
                || request.getLastName().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Last name is required"
            );
        }

        boolean hasEmail =
                request.getEmail() != null
                        && !request.getEmail().isBlank();

        boolean hasPhone =
                request.getPhone() != null
                        && !request.getPhone().isBlank();

        if (!hasEmail && !hasPhone) {
            throw new InvalidAuthRequestException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new InvalidAuthRequestException(
                    "Provide either email or phone, not both"
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Password is required"
            );
        }
    }


    // =========================================================
    // VALIDATE SELLER REGISTER
    // =========================================================

    private void validateSellerRegisterRequest(
            SellerRegisterRequest request) {

        if (request == null) {
            throw new InvalidAuthRequestException(
                    "Seller registration request cannot be null"
            );
        }

        if (request.getFirstName() == null
                || request.getFirstName().isBlank()) {

            throw new InvalidAuthRequestException(
                    "First name is required"
            );
        }

        if (request.getLastName() == null
                || request.getLastName().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Last name is required"
            );
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Email is required"
            );
        }

        if (request.getPhone() == null
                || request.getPhone().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Phone number is required"
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Password is required"
            );
        }

        if (request.getBusinessName() == null
                || request.getBusinessName().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Business name is required"
            );
        }
    }


    // =========================================================
    // VALIDATE LOGIN
    // =========================================================

    private void validateLoginRequest(
            LoginRequest request) {

        if (request == null) {
            throw new InvalidAuthRequestException(
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
            throw new InvalidAuthRequestException(
                    "Email or phone is required"
            );
        }

        if (hasEmail && hasPhone) {
            throw new InvalidAuthRequestException(
                    "Provide either email or phone, not both"
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new InvalidAuthRequestException(
                    "Password is required"
            );
        }
    }


    // =========================================================
    // OTP VALIDATION
    // =========================================================

    private void validateOtpAttempts(
            int attempts) {

        if (attempts >= MAX_OTP_ATTEMPTS) {
            throw new OtpVerificationException(
                    "Maximum OTP attempts exceeded"
            );
        }
    }


    private void validateOtpExpiration(
            LocalDateTime expiresAt) {

        if (expiresAt == null
                || !expiresAt.isAfter(
                LocalDateTime.now()
        )) {

            throw new OtpVerificationException(
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
            String value) {

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
            String email) {

        if (email == null || email.isBlank()) {
            return null;
        }

        return email
                .trim()
                .toLowerCase();
    }


    // =========================================================
    // NORMALIZE PHONE
    // =========================================================

    private String normalizePhone(
            String phone) {

        if (phone == null || phone.isBlank()) {
            return null;
        }

        return phone.trim();
    }


    // =========================================================
    // NORMALIZE UPPERCASE
    // =========================================================

    private String normalizeUpperCase(
            String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value
                .trim()
                .toUpperCase();
    }
}