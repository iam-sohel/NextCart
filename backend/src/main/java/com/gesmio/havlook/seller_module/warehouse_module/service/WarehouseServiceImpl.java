package com.gesmio.havlook.seller_module.warehouse_module.service;

import com.gesmio.havlook.seller_module.seller.entity.Seller;
import com.gesmio.havlook.seller_module.seller.repository.SellerRepository;
import com.gesmio.havlook.seller_module.warehouse_module.dto.WarehouseCreateRequest;
import com.gesmio.havlook.seller_module.warehouse_module.dto.WarehouseResponse;
import com.gesmio.havlook.seller_module.warehouse_module.dto.WarehouseUpdateRequest;
import com.gesmio.havlook.seller_module.warehouse_module.entity.Warehouse;
import com.gesmio.havlook.seller_module.warehouse_module.entity.WarehouseStatus;
import com.gesmio.havlook.seller_module.warehouse_module.exceptions.WarehouseNotFoundException;
import com.gesmio.havlook.seller_module.warehouse_module.exceptions.WarehouseValidationException;
import com.gesmio.havlook.seller_module.warehouse_module.repository.WarehouseRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final SellerRepository sellerRepository;

    // =========================================================
    // CREATE WAREHOUSE
    // =========================================================

    @Override
    public WarehouseResponse createWarehouse(
            Long userId,
            WarehouseCreateRequest request
    ) {

        if (request == null) {
            throw new WarehouseValidationException(
                    "Warehouse request is required"
            );
        }

        Seller seller = getSeller(userId);

        Warehouse warehouse = Warehouse.builder()
                .seller(seller)
                .warehouseName(request.getWarehouseName())
                .contactPerson(request.getContactPerson())
                .phoneNumber(request.getPhoneNumber())
                .streetAddress(request.getStreetAddress())
                .landmark(request.getLandmark())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .status(WarehouseStatus.ACTIVE)
                .build();

        Warehouse savedWarehouse =
                warehouseRepository.save(warehouse);

        return mapToResponse(savedWarehouse);
    }

    // =========================================================
    // GET MY WAREHOUSES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseResponse> getMyWarehouses(
            Long userId
    ) {

        Seller seller = getSeller(userId);

        return warehouseRepository
                .findBySellerOrderByCreatedAtDesc(seller)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET MY WAREHOUSE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getMyWarehouse(
            Long userId,
            Long warehouseId
    ) {

        Seller seller = getSeller(userId);

        Warehouse warehouse =
                getWarehouse(
                        warehouseId,
                        seller
                );

        return mapToResponse(warehouse);
    }

    // =========================================================
    // UPDATE MY WAREHOUSE
    // =========================================================

    @Override
    public WarehouseResponse updateMyWarehouse(
            Long userId,
            Long warehouseId,
            WarehouseUpdateRequest request
    ) {

        if (request == null) {
            throw new WarehouseValidationException(
                    "Warehouse update request is required"
            );
        }

        Seller seller = getSeller(userId);

        Warehouse warehouse =
                getWarehouse(
                        warehouseId,
                        seller
                );

        if (request.getWarehouseName() != null) {
            warehouse.setWarehouseName(
                    request.getWarehouseName()
            );
        }

        if (request.getContactPerson() != null) {
            warehouse.setContactPerson(
                    request.getContactPerson()
            );
        }

        if (request.getPhoneNumber() != null) {
            warehouse.setPhoneNumber(
                    request.getPhoneNumber()
            );
        }

        if (request.getStreetAddress() != null) {
            warehouse.setStreetAddress(
                    request.getStreetAddress()
            );
        }

        if (request.getLandmark() != null) {
            warehouse.setLandmark(
                    request.getLandmark()
            );
        }

        if (request.getCity() != null) {
            warehouse.setCity(
                    request.getCity()
            );
        }

        if (request.getState() != null) {
            warehouse.setState(
                    request.getState()
            );
        }

        if (request.getPostalCode() != null) {
            warehouse.setPostalCode(
                    request.getPostalCode()
            );
        }

        if (request.getCountry() != null) {
            warehouse.setCountry(
                    request.getCountry()
            );
        }

        return mapToResponse(warehouse);
    }

    // =========================================================
    // DEACTIVATE WAREHOUSE
    // =========================================================

    @Override
    public void deactivateWarehouse(
            Long userId,
            Long warehouseId
    ) {

        Seller seller = getSeller(userId);

        Warehouse warehouse =
                getWarehouse(
                        warehouseId,
                        seller
                );

        warehouse.setStatus(
                WarehouseStatus.INACTIVE
        );
    }

    // =========================================================
    // GET SELLER
    // =========================================================

    private Seller getSeller(Long userId) {

        if (userId == null || userId <= 0) {
            throw new WarehouseValidationException(
                    "Invalid user id"
            );
        }

        return sellerRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new WarehouseValidationException(
                                "Seller profile not found"
                        )
                );
    }

    // =========================================================
    // GET WAREHOUSE
    // =========================================================

    private Warehouse getWarehouse(
            Long warehouseId,
            Seller seller
    ) {

        if (warehouseId == null || warehouseId <= 0) {
            throw new WarehouseValidationException(
                    "Invalid warehouse id"
            );
        }

        return warehouseRepository
                .findByIdAndSeller(
                        warehouseId,
                        seller
                )
                .orElseThrow(() ->
                        new WarehouseNotFoundException(
                                "Warehouse not found"
                        )
                );
    }

    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private WarehouseResponse mapToResponse(
            Warehouse warehouse
    ) {

        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .sellerId(
                        warehouse.getSeller().getId()
                )
                .warehouseName(
                        warehouse.getWarehouseName()
                )
                .contactPerson(
                        warehouse.getContactPerson()
                )
                .phoneNumber(
                        warehouse.getPhoneNumber()
                )
                .streetAddress(
                        warehouse.getStreetAddress()
                )
                .landmark(
                        warehouse.getLandmark()
                )
                .city(
                        warehouse.getCity()
                )
                .state(
                        warehouse.getState()
                )
                .postalCode(
                        warehouse.getPostalCode()
                )
                .country(
                        warehouse.getCountry()
                )
                .status(
                        warehouse.getStatus()
                )
                .createdAt(
                        warehouse.getCreatedAt()
                )
                .updatedAt(
                        warehouse.getUpdatedAt()
                )
                .build();
    }
}