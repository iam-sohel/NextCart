package com.nextcart.nextcart.auth_module.repository;

import com.nextcart.nextcart.auth_module.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetOtpRepository
        extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp>
    findTopByEmailOrderByCreatedAtDesc(String email);

    Optional<PasswordResetOtp>
    findTopByPhoneOrderByCreatedAtDesc(String phone);

    Optional<PasswordResetOtp>
    findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(
            String email
    );

    Optional<PasswordResetOtp>
    findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(
            String phone
    );

    Optional<PasswordResetOtp>
    findByResetTokenHash(String resetTokenHash);

    void deleteByEmail(String email);

    void deleteByPhone(String phone);
}