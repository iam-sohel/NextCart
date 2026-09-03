package com.nextcart.nextcart.auth_module.repository;

import com.nextcart.nextcart.auth_module.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findTopByEmailOrderByCreatedAtDesc(String email);

    Optional<EmailOtp> findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);

    void deleteByEmail(String email);
}