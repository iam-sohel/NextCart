package com.nextcart.nextcart.address_module.service.address;

import com.nextcart.nextcart.address_module.dto.AddressRequestDTO;
import com.nextcart.nextcart.address_module.dto.AddressResponseDTO;

import java.util.List;

public interface AddressService {
    AddressResponseDTO addAddress(String userEmail, AddressRequestDTO requestDto);
    List<AddressResponseDTO> getUserAddresses(String userEmail);
    AddressResponseDTO getAddressById(String userEmail, Long addressId);
    AddressResponseDTO updateAddress(String userEmail, Long addressId, AddressRequestDTO requestDto);
    void deleteAddress(String userEmail, Long addressId);
    AddressResponseDTO setDefaultAddress(String userEmail, Long addressId);
}
