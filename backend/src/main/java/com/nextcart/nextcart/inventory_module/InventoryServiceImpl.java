package com.nextcart.nextcart.inventory_module;

import com.nextcart.nextcart.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.inventory_module.dto.InventoryUpdateRequest;
import com.nextcart.nextcart.inventory_module.exceptions.InsufficientStockException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryAlreadyExistsException;
import com.nextcart.nextcart.inventory_module.exceptions.InventoryNotFoundException;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductVariantRepository productVariantRepository;

    // =========================================================
    // CREATE INVENTORY
    // =========================================================

    @Override
    @Transactional
    public InventoryResponse createInventory(
            InventoryCreateRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Inventory request is required"
            );
        }

        Long productVariantId =
                request.getProductVariantId();

        if (productVariantId == null) {
            throw new IllegalArgumentException(
                    "Product variant ID is required"
            );
        }

        if (request.getAvailableStock() == null) {
            throw new IllegalArgumentException(
                    "Available stock is required"
            );
        }

        if (request.getAvailableStock() < 0) {
            throw new IllegalArgumentException(
                    "Available stock cannot be negative"
            );
        }

        if (inventoryRepository.existsByProductVariantId(
                productVariantId)) {

            throw new InventoryAlreadyExistsException(
                    "Inventory already exists for product variant: "
                            + productVariantId
            );
        }

        ProductVariantEntity productVariant =
                productVariantRepository.findById(
                        productVariantId
                ).orElseThrow(() ->
                        new EntityNotFoundException(
                                "Product variant not found: "
                                        + productVariantId
                        )
                );

        InventoryEntity inventory =
                InventoryEntity.builder()
                        .productVariant(productVariant)
                        .availableStock(
                                request.getAvailableStock()
                        )
                        .reservedStock(0)
                        .build();

        InventoryEntity saved =
                inventoryRepository.save(inventory);

        return mapToResponse(saved);
    }

    // =========================================================
    // GET INVENTORY BY ID
    // =========================================================

    @Override
    public InventoryResponse getInventoryById(Long id) {

        validateId(id);

        InventoryEntity inventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new InventoryNotFoundException(
                                        "Inventory not found: " + id
                                )
                        );

        return mapToResponse(inventory);
    }

    // =========================================================
    // GET INVENTORY BY PRODUCT VARIANT
    // =========================================================

    @Override
    public InventoryResponse getInventoryByProductVariantId(
            Long productVariantId) {

        validateProductVariantId(productVariantId);

        InventoryEntity inventory =
                inventoryRepository
                        .findByProductVariantId(productVariantId)
                        .orElseThrow(() ->
                                new InventoryNotFoundException(
                                        "Inventory not found for product variant: "
                                                + productVariantId
                                )
                        );

        return mapToResponse(inventory);
    }

    // =========================================================
    // UPDATE AVAILABLE STOCK
    // =========================================================

    @Override
    @Transactional
    public InventoryResponse updateInventory(
            Long id,
            InventoryUpdateRequest request) {

        validateId(id);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Inventory update request is required"
            );
        }

        if (request.getAvailableStock() == null) {
            throw new IllegalArgumentException(
                    "Available stock is required"
            );
        }

        if (request.getAvailableStock() < 0) {
            throw new IllegalArgumentException(
                    "Available stock cannot be negative"
            );
        }

        InventoryEntity inventory =
                inventoryRepository
                        .findByIdForUpdate(id)
                        .orElseThrow(() ->
                                new InventoryNotFoundException(
                                        "Inventory not found: " + id
                                )
                        );

        /*
         * reservedStock is intentionally not modified here.
         *
         * Reserved stock is controlled only by:
         *
         * reserveStock()
         * releaseStock()
         * deductStock()
         */
        inventory.setAvailableStock(
                request.getAvailableStock()
        );

        InventoryEntity updated =
                inventoryRepository.save(inventory);

        return mapToResponse(updated);
    }

    // =========================================================
    // DELETE INVENTORY
    // =========================================================

    @Override
    @Transactional
    public void deleteInventory(Long id) {

        validateId(id);

        InventoryEntity inventory =
                inventoryRepository
                        .findByIdForUpdate(id)
                        .orElseThrow(() ->
                                new InventoryNotFoundException(
                                        "Inventory not found: " + id
                                )
                        );

        if (inventory.getReservedStock() > 0) {
            throw new IllegalStateException(
                    "Cannot delete inventory while stock is reserved"
            );
        }

        inventoryRepository.delete(inventory);
    }

    // =========================================================
    // ADD STOCK
    // =========================================================

    @Override
    @Transactional
    public void addStock(
            Long productVariantId,
            Integer quantity) {

        validateStockOperation(
                productVariantId,
                quantity
        );

        InventoryEntity inventory =
                getLockedInventory(productVariantId);

        long newAvailable =
                (long) inventory.getAvailableStock()
                        + quantity;

        if (newAvailable > Integer.MAX_VALUE) {
            throw new IllegalStateException(
                    "Available stock exceeds maximum allowed value"
            );
        }

        inventory.setAvailableStock(
                (int) newAvailable
        );

        inventoryRepository.save(inventory);
    }

    // =========================================================
    // RESERVE STOCK
    // =========================================================

    @Override
    @Transactional
    public void reserveStock(
            Long productVariantId,
            Integer quantity) {

        validateStockOperation(
                productVariantId,
                quantity
        );

        InventoryEntity inventory =
                getLockedInventory(productVariantId);

        if (inventory.getAvailableStock() < quantity) {

            throw new InsufficientStockException(
                    "Insufficient stock for product variant: "
                            + productVariantId
            );
        }

        long newReserved =
                (long) inventory.getReservedStock()
                        + quantity;

        if (newReserved > Integer.MAX_VALUE) {
            throw new IllegalStateException(
                    "Reserved stock exceeds maximum allowed value"
            );
        }

        /*
         * Move stock:
         *
         * available -> reserved
         */
        inventory.setAvailableStock(
                inventory.getAvailableStock() - quantity
        );

        inventory.setReservedStock(
                (int) newReserved
        );

        inventoryRepository.save(inventory);
    }

    // =========================================================
    // RELEASE RESERVED STOCK
    // =========================================================

    @Override
    @Transactional
    public void releaseStock(
            Long productVariantId,
            Integer quantity) {

        validateStockOperation(
                productVariantId,
                quantity
        );

        InventoryEntity inventory =
                getLockedInventory(productVariantId);

        if (inventory.getReservedStock() < quantity) {

            throw new IllegalStateException(
                    "Cannot release more stock than reserved for product variant: "
                            + productVariantId
            );
        }

        /*
         * Move stock:
         *
         * reserved -> available
         */
        inventory.setReservedStock(
                inventory.getReservedStock() - quantity
        );

        long newAvailable =
                (long) inventory.getAvailableStock()
                        + quantity;

        if (newAvailable > Integer.MAX_VALUE) {
            throw new IllegalStateException(
                    "Available stock exceeds maximum allowed value"
            );
        }

        inventory.setAvailableStock(
                (int) newAvailable
        );

        inventoryRepository.save(inventory);
    }

    // =========================================================
    // DEDUCT RESERVED STOCK
    // =========================================================

    @Override
    @Transactional
    public void deductStock(
            Long productVariantId,
            Integer quantity) {

        validateStockOperation(
                productVariantId,
                quantity
        );

        InventoryEntity inventory =
                getLockedInventory(productVariantId);

        if (inventory.getReservedStock() < quantity) {

            throw new IllegalStateException(
                    "Cannot deduct more stock than reserved for product variant: "
                            + productVariantId
            );
        }

        /*
         * availableStock was already reduced during reservation.
         *
         * Therefore only remove the reservation here.
         */
        inventory.setReservedStock(
                inventory.getReservedStock() - quantity
        );

        inventoryRepository.save(inventory);
    }

    // =========================================================
    // GET LOCKED INVENTORY
    // =========================================================

    private InventoryEntity getLockedInventory(
            Long productVariantId) {

        return inventoryRepository
                .findByProductVariantIdForUpdate(
                        productVariantId
                )
                .orElseThrow(() ->
                        new InventoryNotFoundException(
                                "Inventory not found for product variant: "
                                        + productVariantId
                        )
                );
    }

    // =========================================================
    // VALIDATE ID
    // =========================================================

    private void validateId(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Inventory ID is required"
            );
        }

        if (id <= 0) {
            throw new IllegalArgumentException(
                    "Inventory ID must be greater than zero"
            );
        }
    }

    // =========================================================
    // VALIDATE PRODUCT VARIANT
    // =========================================================

    private void validateProductVariantId(
            Long productVariantId) {

        if (productVariantId == null) {
            throw new IllegalArgumentException(
                    "Product variant ID is required"
            );
        }

        if (productVariantId <= 0) {
            throw new IllegalArgumentException(
                    "Product variant ID must be greater than zero"
            );
        }
    }

    // =========================================================
    // VALIDATE STOCK OPERATION
    // =========================================================

    private void validateStockOperation(
            Long productVariantId,
            Integer quantity) {

        validateProductVariantId(productVariantId);

        if (quantity == null) {
            throw new IllegalArgumentException(
                    "Quantity is required"
            );
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }
    }

    // =========================================================
    // MAP RESPONSE
    // =========================================================

    private InventoryResponse mapToResponse(
            InventoryEntity inventory) {

        ProductVariantEntity variant =
                inventory.getProductVariant();

        return InventoryResponse.builder()
                .id(inventory.getId())
                .productVariantId(
                        variant.getId()
                )
                .sku(
                        variant.getSku()
                )
                .availableStock(
                        inventory.getAvailableStock()
                )
                .reservedStock(
                        inventory.getReservedStock()
                )
                .createdAt(
                        inventory.getCreatedAt()
                )
                .updatedAt(
                        inventory.getUpdatedAt()
                )
                .build();
    }
}