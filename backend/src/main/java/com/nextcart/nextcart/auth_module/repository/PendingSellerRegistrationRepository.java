package com.nextcart.nextcart.auth_module.repository;

import com.nextcart.nextcart.auth_module.entity.PendingSellerRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PendingSellerRegistrationRepository
        extends JpaRepository<PendingSellerRegistration, Long> {

    Optional<PendingSellerRegistration> findByEmailIgnoreCase(String email);

    Optional<PendingSellerRegistration> findByPhone(String phone);

    Optional<PendingSellerRegistration> findByEmailIgnoreCaseOrPhone(
            String email,
            String phone
    );

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);

    @Modifying
    @Query("""
        DELETE FROM PendingSellerRegistration p
        WHERE p.expiresAt < :now
        """)
    int deleteExpiredRegistrations(
            @Param("now") LocalDateTime now
    );
}