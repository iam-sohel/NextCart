package com.nextcart.nextcart.address_module.repository;

import com.nextcart.nextcart.address_module.entity.Address;
import com.nextcart.nextcart.customer_module.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByCustomerOrderByIsDefaultDescCreatedAtDesc(
            Customer customer
    );

    Optional<Address> findByIdAndCustomer(
            Long id,
            Customer customer
    );

    @Modifying
    @Query("""
            UPDATE Address a
            SET a.isDefault = false
            WHERE a.customer = :customer
            """)
    void resetDefaultAddressForCustomer(
            @Param("customer") Customer customer
    );
}