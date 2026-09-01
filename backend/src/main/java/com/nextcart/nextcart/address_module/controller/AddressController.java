package com.nextcart.nextcart.address_module.controller;

import com.nextcart.nextcart.adcommon.dto.ApiResponse;
import com.nextcart.nextcart.address_module.dto.AddressRequestDTO;
import com.nextcart.nextcart.address_module.dto.AddressResponseDTO;
import com.nextcart.nextcart.address_module.service.address.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@Tag(
        name = "Address Management",
        description = "APIs for managing user shipping addresses"
)
@SecurityRequirement(name = "bearerAuth")
public class AddressController {

    private final AddressService addressService;

    // =========================================================
    // ADD ADDRESS
    // =========================================================

    @PostMapping
    @Operation(summary = "Add a new address")
    public ResponseEntity<ApiResponse<AddressResponseDTO>> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequestDTO requestDto) {

        AddressResponseDTO response =
                addressService.addAddress(
                        authentication.getName(),
                        requestDto
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Address added successfully",
                                response
                        )
                );
    }

    // =========================================================
    // GET ADDRESSES
    // =========================================================

    @GetMapping
    @Operation(summary = "Get all addresses for the logged-in user")
    public ResponseEntity<ApiResponse<List<AddressResponseDTO>>> getUserAddresses(
            Authentication authentication) {

        List<AddressResponseDTO> response =
                addressService.getUserAddresses(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Addresses retrieved successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET ADDRESS
    // =========================================================

    @GetMapping("/{id}")
    @Operation(summary = "Get address by ID")
    public ResponseEntity<ApiResponse<AddressResponseDTO>> getAddressById(
            Authentication authentication,
            @PathVariable("id") Long addressId) {

        AddressResponseDTO response =
                addressService.getAddressById(
                        authentication.getName(),
                        addressId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Address retrieved successfully",
                        response
                )
        );
    }

    // =========================================================
    // UPDATE ADDRESS
    // =========================================================

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing address")
    public ResponseEntity<ApiResponse<AddressResponseDTO>> updateAddress(
            Authentication authentication,
            @PathVariable("id") Long addressId,
            @Valid @RequestBody AddressRequestDTO requestDto) {

        AddressResponseDTO response =
                addressService.updateAddress(
                        authentication.getName(),
                        addressId,
                        requestDto
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Address updated successfully",
                        response
                )
        );
    }

    // =========================================================
    // DELETE ADDRESS
    // =========================================================

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an address")
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            Authentication authentication,
            @PathVariable("id") Long addressId) {

        addressService.deleteAddress(
                authentication.getName(),
                addressId
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Address deleted successfully",
                        "Address removed"
                )
        );
    }

    // =========================================================
    // SET DEFAULT ADDRESS
    // =========================================================

    @PatchMapping("/{id}/default")
    @Operation(summary = "Set an address as default")
    public ResponseEntity<ApiResponse<AddressResponseDTO>> setDefaultAddress(
            Authentication authentication,
            @PathVariable("id") Long addressId) {

        AddressResponseDTO response =
                addressService.setDefaultAddress(
                        authentication.getName(),
                        addressId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Default address set successfully",
                        response
                )
        );
    }
}