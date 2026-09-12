package com.nextcart.nextcart.auth_module.repository;

import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    // =========================================================
    // NORMAL LOOKUP
    // =========================================================

    Optional<RefreshToken> findByTokenHash(
            String tokenHash
    );


    // =========================================================
    // LOCKED LOOKUP - REFRESH TOKEN ROTATION
    // =========================================================

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT rt
            FROM RefreshToken rt
            JOIN FETCH rt.user
            WHERE rt.tokenHash = :tokenHash
            """)
    Optional<RefreshToken> findByTokenHashForUpdate(
            @Param("tokenHash") String tokenHash
    );


    // =========================================================
    // ACTIVE TOKENS BY USER
    // =========================================================

    List<RefreshToken> findAllByUserIdAndRevokedFalse(
            Long userId
    );


    // =========================================================
    // DELETE ALL TOKENS
    // =========================================================

    void deleteAllByUserId(
            Long userId
    );
}