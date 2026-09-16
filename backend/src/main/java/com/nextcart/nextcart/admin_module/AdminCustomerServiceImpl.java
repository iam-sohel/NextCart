package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.admin_module.service.AdminCustomerService;
import com.nextcart.nextcart.customer_module.dto.CustomerResponse;
import com.nextcart.nextcart.customer_module.entity.Customer;
import com.nextcart.nextcart.customer_module.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCustomerServiceImpl implements AdminCustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {

        return customerRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: " + customerId
                        )
                );

        return mapToResponse(customer);
    }

    @Override
    public void activateCustomer(Long customerId) {

        Customer customer = getCustomer(customerId);

        if (!customer.isActive()) {
            customer.setActive(true);
            customerRepository.save(customer);
        }
    }

    @Override
    public void deactivateCustomer(Long customerId) {

        Customer customer = getCustomer(customerId);

        if (customer.isActive()) {
            customer.setActive(false);
            customerRepository.save(customer);
        }
    }

    private Customer getCustomer(Long customerId) {

        return customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with id: " + customerId
                        )
                );
    }

    private CustomerResponse mapToResponse(Customer customer) {

        return CustomerResponse.builder()
                .firstName(customer.getUser().getFirstName())
                .lastName(customer.getUser().getLastName())
                .email(customer.getUser().getEmail())
                .phone(customer.getUser().getPhone())
                .active(customer.isActive())
                .build();
    }
}