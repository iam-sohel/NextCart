package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.common.dto.ApiResponse;
import com.nextcart.nextcart.customer_module.dto.CustomerResponse;
import com.nextcart.nextcart.admin_module.service.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> getAllCustomers(
            @PageableDefault(
                    size = 20,
                    sort = "id",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable) {

        Page<CustomerResponse> response =
                adminCustomerService.getAllCustomers(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Customers fetched successfully",
                        response
                )
        );
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(
            @PathVariable Long customerId) {

        CustomerResponse response =
                adminCustomerService.getCustomerById(customerId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Customer fetched successfully",
                        response
                )
        );
    }

    @PutMapping("/{customerId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateCustomer(
            @PathVariable Long customerId) {

        adminCustomerService.activateCustomer(customerId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Customer activated successfully",
                        null
                )
        );
    }

    @PutMapping("/{customerId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateCustomer(
            @PathVariable Long customerId) {

        adminCustomerService.deactivateCustomer(customerId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Customer deactivated successfully",
                        null
                )
        );
    }
}