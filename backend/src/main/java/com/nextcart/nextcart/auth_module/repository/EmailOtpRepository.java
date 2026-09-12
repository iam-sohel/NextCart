package com.nextcart.nextcart.auth_module.repository;

import com.nextcart.nextcart.auth_module.entity.EmailOtp;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findTopByEmailOrderByCreatedAtDesc(String email);

    Optional<EmailOtp> findTopByEmailIgnoreCaseAndVerifiedFalseOrderByCreatedAtDesc(
            String email
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT e
        FROM EmailOtp e
        WHERE LOWER(e.email) = LOWER(:email)
          AND e.verified = false
        ORDER BY e.createdAt DESC
        """)
    Optional<EmailOtp> findLatestUnverifiedByEmailForUpdate(
            @Param("email") String email
    );

    void deleteByEmail(String email);

    int deleteByExpiresAtBefore(LocalDateTime dateTime);
}