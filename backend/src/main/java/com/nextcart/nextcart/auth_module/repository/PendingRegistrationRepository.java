package com.nextcart.nextcart.auth_module.repository;

import com.nextcart.nextcart.auth_module.entity.PendingRegistration;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PendingRegistrationRepository
        extends JpaRepository<PendingRegistration, Long> {

    /*
     * Normal lookup
     */
    Optional<PendingRegistration> findByEmailIgnoreCase(String email);

    Optional<PendingRegistration> findByPhone(String phone);

    /*
     * Legacy / compatibility lookup.
     * Not preferred for the new email-only / phone-only flow.
     */
    Optional<PendingRegistration> findByEmailIgnoreCaseAndPhone(
            String email,
            String phone
    );

    /*
     * Existence checks
     */
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);

    /*
     * Delete pending registrations by identifier
     */
    void deleteByEmailIgnoreCase(String email);

    void deleteByPhone(String phone);

    /*
     * =========================================================
     * LOCKED LOOKUPS
     * =========================================================
     *
     * Used when verification/completion modifies the same
     * pending-registration row.
     *
     * Prevents concurrent requests from modifying the same
     * registration simultaneously.
     */

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p
            FROM PendingRegistration p
            WHERE LOWER(p.email) = LOWER(:email)
            """)
    Optional<PendingRegistration> findByEmailIgnoreCaseForUpdate(
            @Param("email") String email
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p
            FROM PendingRegistration p
            WHERE p.phone = :phone
            """)
    Optional<PendingRegistration> findByPhoneForUpdate(
            @Param("phone") String phone
    );

    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     *
     * Used by a scheduled cleanup job to remove expired
     * registrations and keep the table small.
     */
    long deleteByExpiresAtBefore(LocalDateTime expiryTime);
}