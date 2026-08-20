package com.nextcart.nextcart.inventory_module.service;

import com.nextcart.nextcart.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.inventory_module.dto.InventoryUpdateRequest;
import com.nextcart.nextcart.inventory_module.entity.Inventory;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryAlreadyExistsException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryNotFoundException;
import com.nextcart.nextcart.inventory_module.mapper.InventoryMapper;
import com.nextcart.nextcart.inventory_module.repository.InventoryRepository;

import com.nextcart.nextcart.product_module.entity.ProductVariant;
import com.nextcart.nextcart.product_module.exceptions.ProductVariantNotFoundException;
import com.nextcart.nextcart.product_module.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    private final ProductVariantRepository productVariantRepository;

    private final InventoryMapper inventoryMapper;


    // =========================
    // CREATE
    // =========================

    @Override
    public InventoryResponse createInventory(
            InventoryCreateRequest request) {

        ProductVariant variant =
                productVariantRepository.findById(
                        request.getVariantId()
                ).orElseThrow(() ->
                        new ProductVariantNotFoundException(
                                "Product variant not found with id: "
                                        + request.getVariantId()
                        )
                );

        if (inventoryRepository.existsByVariantId(
                request.getVariantId())) {

            throw new InventoryAlreadyExistsException(
                    "Inventory already exists for variant id: "
                            + request.getVariantId()
            );
        }

        Inventory inventory =
                inventoryMapper.toEntity(
                        request,
                        variant
                );

        Inventory savedInventory =
                inventoryRepository.save(inventory);

        return inventoryMapper.toResponse(
                savedInventory
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryById(Long id) {

        Inventory inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new InventoryNotFoundException(
                                        "Inventory not found with id: "
                                                + id
                                )
                        );

        return inventoryMapper.toResponse(inventory);
    }


    // =========================
    // GET BY VARIANT
    // =========================

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByVariantId(
            Long variantId) {

        productVariantRepository.findById(variantId)
                .orElseThrow(() ->
                        new ProductVariantNotFoundException(
                                "Product variant not found with id: "
                                        + variantId
                        )
                );

        Inventory inventory =
                inventoryRepository
                        .findByVariantId(variantId)
                        .orElseThrow(() ->
                                new InventoryNotFoundException(
                                        "Inventory not found for variant id: "
                                                + variantId
                                )
                        );

        return inventoryMapper.toResponse(inventory);
    }


    // =========================
    // GET ALL
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventories() {

        return inventoryRepository.findAll()
                .stream()
                .map(inventoryMapper::toResponse)
                .toList();
    }


    // =========================
    // UPDATE
    // =========================

    @Override
    public InventoryResponse updateInventory(
            Long id,
            InventoryUpdateRequest request) {

        Inventory inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new InventoryNotFoundException(
                                        "Inventory not found with id: "
                                                + id
                                )
                        );

        inventoryMapper.updateEntity(
                request,
                inventory
        );

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return inventoryMapper.toResponse(
                updatedInventory
        );
    }


    // =========================
    // DELETE
    // =========================

    @Override
    public void deleteInventory(Long id) {

        Inventory inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new InventoryNotFoundException(
                                        "Inventory not found with id: "
                                                + id
                                )
                        );

        inventoryRepository.delete(inventory);
    }
}