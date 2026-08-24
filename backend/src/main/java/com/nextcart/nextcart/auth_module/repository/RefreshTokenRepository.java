package com.nextcart.nextcart.auth_module.repository;

import com.nextcart.nextcart.auth_module.entity.RefreshToken;
import com.nextcart.nextcart.user_module.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUser(User user);

    Optional<RefreshToken> findByUser_Id(Long userId);

    void deleteByUser(User user);

    void deleteByUser_Id(Long userId);
}