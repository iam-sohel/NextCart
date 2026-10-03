package com.gesmio.havlook.auth_module.repository;

import com.gesmio.havlook.auth_module.entity.PhoneOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhoneOtpRepository extends JpaRepository<PhoneOtp, Long> {

    Optional<PhoneOtp> findTopByPhoneOrderByCreatedAtDesc(String phone);

    Optional<PhoneOtp> findTopByPhoneAndVerifiedFalseOrderByCreatedAtDesc(String phone);

    void deleteByPhone(String phone);
}