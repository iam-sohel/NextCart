package com.nextcart.nextcart.customer_module.repository;

import com.nextcart.nextcart.customer_module.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}