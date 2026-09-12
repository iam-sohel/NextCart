package com.nextcart.nextcart.address_module.service.address;

import com.nextcart.nextcart.address_module.dto.AddressRequestDTO;
import com.nextcart.nextcart.address_module.dto.AddressResponseDTO;
import com.nextcart.nextcart.address_module.entity.Address;
import com.nextcart.nextcart.address_module.repository.AddressRepository;
import com.nextcart.nextcart.customer_module.entity.Customer;
import com.nextcart.nextcart.customer_module.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;

    // =========================================================
    // ADD ADDRESS
    // =========================================================

    @Override
    public AddressResponseDTO addAddress(
            Long userId,
            AddressRequestDTO requestDto
    ) {

        Customer customer = getCustomer(userId);

        List<Address> existingAddresses =
                addressRepository.findByCustomerOrderByIsDefaultDescCreatedAtDesc(
                        customer
                );

        boolean shouldBeDefault =
                existingAddresses.isEmpty()
                        || Boolean.TRUE.equals(requestDto.getIsDefault());

        if (shouldBeDefault) {
            addressRepository.resetDefaultAddressForCustomer(customer);
        }

        Address address = Address.builder()
                .customer(customer)
                .fullName(requestDto.getFullName())
                .phoneNumber(requestDto.getPhoneNumber())
                .streetAddress(requestDto.getStreetAddress())
                .landmark(requestDto.getLandmark())
                .city(requestDto.getCity())
                .state(requestDto.getState())
                .postalCode(requestDto.getPostalCode())
                .country(requestDto.getCountry())
                .isDefault(shouldBeDefault)
                .build();

        Address savedAddress = addressRepository.save(address);

        return mapToResponse(savedAddress);
    }

    // =========================================================
    // GET ALL ADDRESSES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponseDTO> getUserAddresses(Long userId) {

        Customer customer = getCustomer(userId);

        return addressRepository
                .findByCustomerOrderByIsDefaultDescCreatedAtDesc(customer)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET ADDRESS BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public AddressResponseDTO getAddressById(
            Long userId,
            Long addressId
    ) {

        Customer customer = getCustomer(userId);

        Address address = addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new RuntimeException("Address not found")
                );

        return mapToResponse(address);
    }

    // =========================================================
    // UPDATE ADDRESS
    // =========================================================

    @Override
    public AddressResponseDTO updateAddress(
            Long userId,
            Long addressId,
            AddressRequestDTO requestDto
    ) {

        Customer customer = getCustomer(userId);

        Address address = addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new RuntimeException("Address not found")
                );

        boolean requestedDefault =
                Boolean.TRUE.equals(requestDto.getIsDefault());

        /*
         * If this address is being changed to default,
         * remove default status from all other addresses.
         */
        if (requestedDefault && !Boolean.TRUE.equals(address.getIsDefault())) {

            addressRepository.resetDefaultAddressForCustomer(customer);

            address.setIsDefault(true);
        }

        /*
         * Do not allow the existing default address to become
         * non-default without another default address being selected.
         */
        if (!requestedDefault && Boolean.TRUE.equals(address.getIsDefault())) {
            address.setIsDefault(true);
        }

        address.setFullName(requestDto.getFullName());
        address.setPhoneNumber(requestDto.getPhoneNumber());
        address.setStreetAddress(requestDto.getStreetAddress());
        address.setLandmark(requestDto.getLandmark());
        address.setCity(requestDto.getCity());
        address.setState(requestDto.getState());
        address.setPostalCode(requestDto.getPostalCode());
        address.setCountry(requestDto.getCountry());

        Address updatedAddress = addressRepository.save(address);

        return mapToResponse(updatedAddress);
    }

    // =========================================================
    // DELETE ADDRESS
    // =========================================================

    @Override
    public void deleteAddress(
            Long userId,
            Long addressId
    ) {

        Customer customer = getCustomer(userId);

        Address address = addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new RuntimeException("Address not found")
                );

        boolean wasDefault =
                Boolean.TRUE.equals(address.getIsDefault());

        addressRepository.delete(address);

        /*
         * If the deleted address was default,
         * promote the next available address.
         */
        if (wasDefault) {

            List<Address> remainingAddresses =
                    addressRepository
                            .findByCustomerOrderByIsDefaultDescCreatedAtDesc(
                                    customer
                            );

            if (!remainingAddresses.isEmpty()) {

                Address newDefault = remainingAddresses.get(0);

                newDefault.setIsDefault(true);

                addressRepository.save(newDefault);
            }
        }
    }

    // =========================================================
    // SET DEFAULT ADDRESS
    // =========================================================

    @Override
    public AddressResponseDTO setDefaultAddress(
            Long userId,
            Long addressId
    ) {

        Customer customer = getCustomer(userId);

        Address address = addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new RuntimeException("Address not found")
                );

        addressRepository.resetDefaultAddressForCustomer(customer);

        address.setIsDefault(true);

        Address savedAddress = addressRepository.save(address);

        return mapToResponse(savedAddress);
    }

    // =========================================================
    // GET CUSTOMER
    // =========================================================

    private Customer getCustomer(Long userId) {

        return customerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer profile not found"
                        )
                );
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private AddressResponseDTO mapToResponse(Address address) {

        return AddressResponseDTO.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .streetAddress(address.getStreetAddress())
                .landmark(address.getLandmark())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}