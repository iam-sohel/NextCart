package com.gesmio.havlook.cart_module;

import com.gesmio.havlook.user_module.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository
        extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserId(Long userId);

    boolean existsByUser(User user);

    boolean existsByUserId(Long userId);
}