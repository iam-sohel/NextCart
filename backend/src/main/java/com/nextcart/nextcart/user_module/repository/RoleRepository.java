        package com.nextcart.nextcart.user_module.repository;

import com.nextcart.nextcart.user_module.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    // =========================================================
    // ROLE LOOKUP
    // =========================================================

    Optional<Role> findByNameIgnoreCase(String name);


    // =========================================================
    // ROLE VALIDATION
    // =========================================================

    boolean existsByNameIgnoreCase(String name);
}
