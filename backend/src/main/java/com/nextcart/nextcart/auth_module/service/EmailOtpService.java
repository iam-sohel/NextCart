package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.entity.EmailOtp;
import com.nextcart.nextcart.auth_module.repository.EmailOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void generateAndSendOtp(String email) {

        String normalizedEmail = email.trim().toLowerCase();

        // Invalidate previous OTPs
        emailOtpRepository.deleteByEmail(normalizedEmail);

        String otp = generateOtp();

        EmailOtp emailOtp = EmailOtp.builder()
                .email(normalizedEmail)
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .attempts(0)
                .verified(false)
                .build();

        emailOtpRepository.save(emailOtp);

        String subject = "NextCart Password Reset OTP";

        String body = """
                Hello,

                Your NextCart password reset OTP is: %s

                This OTP is valid for 5 minutes.

                You have a maximum of 5 verification attempts.

                If you did not request a password reset, please ignore this email.

                Regards,
                NextCart Team
                """.formatted(otp);

        emailService.sendEmail(
                normalizedEmail,
                subject,
                body
        );
    }

    @Transactional
    public void verifyOtp(String email, String otp) {

        String normalizedEmail = email.trim().toLowerCase();

        EmailOtp emailOtp = emailOtpRepository
                .findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid or expired OTP"));

        if (emailOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        if (emailOtp.getAttempts() >= MAX_ATTEMPTS) {
            throw new IllegalArgumentException(
                    "Maximum OTP verification attempts exceeded"
            );
        }

        emailOtp.setAttempts(emailOtp.getAttempts() + 1);

        if (!passwordEncoder.matches(otp, emailOtp.getOtpHash())) {
            emailOtpRepository.save(emailOtp);
            throw new IllegalArgumentException("Invalid OTP");
        }

        emailOtp.setVerified(true);
        emailOtp.setVerifiedAt(LocalDateTime.now());

        emailOtpRepository.save(emailOtp);
    }

    private String generateOtp() {

        int otp = secureRandom.nextInt(900000) + 100000;

        return String.valueOf(otp);
    }
}