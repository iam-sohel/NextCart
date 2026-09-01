package com.nextcart.nextcart.user_module.repository;

import com.nextcart.nextcart.user_module.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // =========================================================
    // AUTHENTICATION / USER LOOKUP
    // =========================================================

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByPhone(String phone);


    // =========================================================
    // DUPLICATE VALIDATION
    // =========================================================

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);
}
