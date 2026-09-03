package com.nextcart.nextcart.auth_module.repository;

import com.nextcart.nextcart.auth_module.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PendingRegistrationRepository
        extends JpaRepository<PendingRegistration, Long> {

    Optional<PendingRegistration> findByEmailIgnoreCase(String email);

    Optional<PendingRegistration> findByPhone(String phone);

    Optional<PendingRegistration> findByEmailIgnoreCaseAndPhone(
            String email,
            String phone
    );

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);

    void deleteByEmailIgnoreCase(String email);

    void deleteByPhone(String phone);
}