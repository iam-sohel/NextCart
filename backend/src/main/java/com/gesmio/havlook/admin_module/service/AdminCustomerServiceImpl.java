package com.gesmio.havlook.admin_module.service;

import com.gesmio.havlook.admin_module.exceptions.AdminCustomerNotFoundException;
import com.gesmio.havlook.admin_module.exceptions.AdminCustomerStateException;
import com.gesmio.havlook.admin_module.exceptions.AdminCustomerValidationException;
import com.gesmio.havlook.customer_module.dto.CustomerResponse;
import com.gesmio.havlook.customer_module.entity.Customer;
import com.gesmio.havlook.customer_module.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCustomerServiceImpl
        implements AdminCustomerService {

    private final CustomerRepository customerRepository;

    // =========================================================
    // GET ALL CUSTOMERS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(
            Pageable pageable
    ) {

        if (pageable == null) {
            throw new AdminCustomerValidationException(
                    "Pageable information is required"
            );
        }

        return customerRepository
                .findAll(pageable)
                .map(this::mapToResponse);
    }

    // =========================================================
    // GET CUSTOMER BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(
            Long customerId
    ) {

        Customer customer =
                getCustomer(customerId);

        return mapToResponse(customer);
    }

    // =========================================================
    // ACTIVATE CUSTOMER
    // =========================================================

    @Override
    public void activateCustomer(
            Long customerId
    ) {

        Customer customer =
                getCustomer(customerId);

        if (customer.isActive()) {
            throw new AdminCustomerStateException(
                    "Customer is already active"
            );
        }

        customer.setActive(true);

        customerRepository.save(customer);
    }

    // =========================================================
    // DEACTIVATE CUSTOMER
    // =========================================================

    @Override
    public void deactivateCustomer(
            Long customerId
    ) {

        Customer customer =
                getCustomer(customerId);

        if (!customer.isActive()) {
            throw new AdminCustomerStateException(
                    "Customer is already inactive"
            );
        }

        customer.setActive(false);

        customerRepository.save(customer);
    }

    // =========================================================
    // GET CUSTOMER
    // =========================================================

    private Customer getCustomer(
            Long customerId
    ) {

        if (customerId == null ||
                customerId <= 0) {

            throw new AdminCustomerValidationException(
                    "Invalid customer id"
            );
        }

        return customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new AdminCustomerNotFoundException(
                                "Customer not found with id: "
                                        + customerId
                        )
                );
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private CustomerResponse mapToResponse(
            Customer customer
    ) {

        return CustomerResponse.builder()
                .firstName(
                        customer.getUser().getFirstName()
                )
                .lastName(
                        customer.getUser().getLastName()
                )
                .email(
                        customer.getUser().getEmail()
                )
                .phone(
                        customer.getUser().getPhone()
                )
                .active(
                        customer.isActive()
                )
                .build();
    }
}