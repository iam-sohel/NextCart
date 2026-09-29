package com.gesmio.havlook.admin_module.service;

import com.gesmio.havlook.customer_module.dto.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminCustomerService {

    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    CustomerResponse getCustomerById(Long customerId);

    void activateCustomer(Long customerId);

    void deactivateCustomer(Long customerId);
}