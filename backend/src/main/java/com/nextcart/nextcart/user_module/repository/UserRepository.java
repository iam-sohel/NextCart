package com.nextcart.nextcart.user_module.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nextcart.nextcart.user_module.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);
}