package com.nextcart.nextcart.auth_module.service;

import com.nextcart.nextcart.auth_module.entity.PhoneOtp;
import com.nextcart.nextcart.auth_module.repository.PhoneOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PhoneOtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    private final PhoneOtpRepository phoneOtpRepository;
    private final PasswordEncoder passwordEncoder;

    /*
     * SMS provider will be integrated here.
     * For example: MSG91 / Twilio / AWS SNS.
     */
    private final SmsService smsService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void generateAndSendOtp(String phone) {

        String normalizedPhone = normalizePhone(phone);

        // Invalidate all previous OTPs
        phoneOtpRepository.deleteByPhone(normalizedPhone);

        String otp = generateOtp();

        PhoneOtp phoneOtp = PhoneOtp.builder()
                .phone(normalizedPhone)
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .attempts(0)
                .verified(false)
                .build();

        phoneOtpRepository.save(phoneOtp);

        /*
         * Never log the OTP in production.
         */
        smsService.sendOtp(normalizedPhone, otp);
    }

    @Transactional
    public void verifyOtp(String phone, String otp) {

        String normalizedPhone = normalizePhone(phone);

        PhoneOtp phoneOtp = phoneOtpRepository
                .findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(normalizedPhone)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid or expired OTP"));

        LocalDateTime now = LocalDateTime.now();

        if (phoneOtp.getExpiresAt().isBefore(now)) {
            throw new IllegalArgumentException("OTP has expired");
        }

        if (phoneOtp.getAttempts() >= MAX_ATTEMPTS) {
            throw new IllegalArgumentException(
                    "Maximum OTP verification attempts exceeded"
            );
        }

        phoneOtp.setAttempts(phoneOtp.getAttempts() + 1);

        if (!passwordEncoder.matches(otp, phoneOtp.getOtpHash())) {
            phoneOtpRepository.save(phoneOtp);
            throw new IllegalArgumentException("Invalid OTP");
        }

        phoneOtp.setVerified(true);
        phoneOtp.setVerifiedAt(now);

        phoneOtpRepository.save(phoneOtp);
    }

    private String generateOtp() {

        return String.valueOf(
                secureRandom.nextInt(900000) + 100000
        );
    }

    private String normalizePhone(String phone) {

        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        return phone.trim();
    }
}