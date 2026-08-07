package com.nextcart.nextcart.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nextcart.nextcart.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

}