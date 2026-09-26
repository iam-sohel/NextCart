package com.nextcart.nextcart.customer_module.service;

import com.nextcart.nextcart.customer_module.dto.CustomerResponse;
import com.nextcart.nextcart.customer_module.dto.CustomerUpdateRequest;
import com.nextcart.nextcart.customer_module.entity.Customer;
import com.nextcart.nextcart.customer_module.exceptions.CustomerNotFoundException;
import com.nextcart.nextcart.customer_module.exceptions.CustomerUserNotFoundException;
import com.nextcart.nextcart.customer_module.repository.CustomerRepository;
import com.nextcart.nextcart.customer_module.service.CustomerService;
import com.nextcart.nextcart.customer_module.exceptions.CustomerValidationException;
import com.nextcart.nextcart.user_module.entity.User;
import com.nextcart.nextcart.user_module.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    // =========================================================
    // GET MY PROFILE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getMyProfile(Long userId) {

        validateUserId(userId);

        Customer customer = customerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new CustomerNotFoundException(
                                "Customer profile not found"
                        )
                );

        User user = customer.getUser();

        if (user == null) {
            throw new CustomerUserNotFoundException(
                    "User associated with customer profile was not found"
            );
        }

        return mapToResponse(customer, user);
    }

    // =========================================================
    // UPDATE MY PROFILE
    // =========================================================

    @Override
    public CustomerResponse updateMyProfile(
            Long userId,
            CustomerUpdateRequest request
    ) {

        validateUserId(userId);

        if (request == null) {
            throw new CustomerValidationException(
                    "Customer update request is required"
            );
        }

        Customer customer = customerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new CustomerNotFoundException(
                                "Customer profile not found"
                        )
                );

        User user = customer.getUser();

        if (user == null) {
            throw new CustomerUserNotFoundException(
                    "User associated with customer profile was not found"
            );
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        userRepository.save(user);

        return mapToResponse(customer, user);
    }

    // =========================================================
    // DEACTIVATE MY ACCOUNT
    // =========================================================

    @Override
    public void deactivateMyAccount(Long userId) {

        validateUserId(userId);

        Customer customer = customerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new CustomerNotFoundException(
                                "Customer profile not found"
                        )
                );

        customer.setActive(false);

        customerRepository.save(customer);
    }

    // =========================================================
    // VALIDATE USER ID
    // =========================================================

    private void validateUserId(Long userId) {

        if (userId == null || userId <= 0) {
            throw new CustomerUserNotFoundException(
                    "Invalid customer user ID"
            );
        }
    }

    // =========================================================
    // MAP ENTITY → RESPONSE
    // =========================================================

    private CustomerResponse mapToResponse(
            Customer customer,
            User user
    ) {

        return CustomerResponse.builder()
                .customerId(customer.getId())
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .active(customer.isActive())
                .build();
    }
}