package com.nextcart.nextcart.customer_module.service;

import com.nextcart.nextcart.customer_module.dto.CustomerResponse;
import com.nextcart.nextcart.customer_module.dto.CustomerUpdateRequest;

public interface CustomerService {

    CustomerResponse getMyProfile(Long userId);

    CustomerResponse updateMyProfile(
            Long userId,
            CustomerUpdateRequest request
    );

    void deactivateMyAccount(Long userId);
}