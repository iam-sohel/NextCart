package com.nextcart.nextcart.seller_module.inventory_module.service;

import com.nextcart.nextcart.product_module.productVariant.ProductVariantEntity;
import com.nextcart.nextcart.product_module.productVariant.ProductVariantRepository;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryCreateRequest;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryItemResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryResponse;
import com.nextcart.nextcart.seller_module.inventory_module.dto.InventoryUpdateRequest;
import com.nextcart.nextcart.seller_module.inventory_module.entity.Inventory;
import com.nextcart.nextcart.seller_module.inventory_module.entity.InventoryItem;
import com.nextcart.nextcart.seller_module.inventory_module.repository.InventoryItemRepository;
import com.nextcart.nextcart.seller_module.inventory_module.repository.InventoryRepository;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import com.nextcart.nextcart.seller_module.warehouse_module.entity.Warehouse;
import com.nextcart.nextcart.seller_module.warehouse_module.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final SellerRepository sellerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public InventoryResponse createInventory(Long userId, InventoryCreateRequest request) {
        validateNonNegativeQuantity(request.getAvailableStock(), "Available stock");

        Seller seller = getSellerByUserId(userId);

        Warehouse warehouse = warehouseRepository
                .findByIdAndSeller(request.getWarehouseId(), seller)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Warehouse not found or does not belong to seller"));

        if (!"ACTIVE".equalsIgnoreCase(warehouse.getStatus().name())) {
            throw new IllegalArgumentException("Warehouse is not active");
        }

        Inventory inventory = inventoryRepository
                .findByWarehouse(warehouse)
                .orElseGet(() -> inventoryRepository.save(
                        Inventory.builder().warehouse(warehouse).build()));

        ProductVariantEntity productVariant = productVariantRepository
                .findById(request.getProductVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Product variant not found"));

        if (inventoryItemRepository.existsByInventoryIdAndProductVariantId(
                inventory.getId(), productVariant.getId())) {
            throw new IllegalArgumentException(
                    "Product variant already exists in this warehouse inventory");
        }

        InventoryItem item = InventoryItem.builder()
                .inventory(inventory)
                .productVariant(productVariant)
                .availableStock(request.getAvailableStock())
                .reservedStock(0)
                .build();

        inventoryItemRepository.save(item);
        return mapToResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByWarehouse(Long userId, Long warehouseId) {
        Seller seller = getSellerByUserId(userId);

        Warehouse warehouse = warehouseRepository
                .findByIdAndSeller(warehouseId, seller)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Warehouse not found or does not belong to seller"));

        Inventory inventory = inventoryRepository.findByWarehouse(warehouse)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inventory not found for warehouse"));

        return mapToResponse(inventory);
    }

    @Override
    public InventoryResponse updateInventoryItem(
            Long userId, Long inventoryItemId, InventoryUpdateRequest request) {

        validateNonNegativeQuantity(request.getAvailableStock(), "Available stock");
        Seller seller = getSellerByUserId(userId);

        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found"));

        Warehouse warehouse = item.getInventory().getWarehouse();
        verifyWarehouseOwnership(warehouse, seller);

        int reserved = safeStock(item.getReservedStock());
        if (request.getAvailableStock() < reserved) {
            throw new IllegalArgumentException(
                    "Available stock cannot be less than reserved stock. Reserved stock: "
                            + reserved + ", requested: " + request.getAvailableStock());
        }

        item.setAvailableStock(request.getAvailableStock());
        inventoryItemRepository.save(item);
        return mapToResponse(item.getInventory());
    }

    @Override
    public void deleteInventoryItem(Long userId, Long inventoryItemId) {
        Seller seller = getSellerByUserId(userId);
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found"));

        verifyWarehouseOwnership(item.getInventory().getWarehouse(), seller);

        if (safeStock(item.getReservedStock()) > 0) {
            throw new IllegalStateException(
                    "Cannot delete inventory item while stock is reserved");
        }

        inventoryItemRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getTotalAvailableStock(Long productVariantId) {
        validateId(productVariantId, "Product variant id");

        return inventoryItemRepository.findByProductVariantId(productVariantId)
                .stream()
                .mapToInt(item -> safeStock(item.getAvailableStock()))
                .sum();
    }

    @Override
    public void addStock(Long warehouseId, Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Stock quantity");
        InventoryItem item = getLockedItem(warehouseId, productVariantId);
        item.setAvailableStock(safeAdd(safeStock(item.getAvailableStock()), quantity));
        inventoryItemRepository.save(item);
    }

    @Override
    public void reserveStock(Long warehouseId, Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Reservation quantity");
        InventoryItem item = getLockedItem(warehouseId, productVariantId);
        int available = safeStock(item.getAvailableStock());

        if (available < quantity) {
            throw new IllegalStateException(
                    "Insufficient stock for product variant: " + productVariantId);
        }

        item.setAvailableStock(available - quantity);
        item.setReservedStock(safeAdd(safeStock(item.getReservedStock()), quantity));
        inventoryItemRepository.save(item);
    }

    @Override
    public void releaseStock(Long warehouseId, Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Release quantity");
        InventoryItem item = getLockedItem(warehouseId, productVariantId);
        int reserved = safeStock(item.getReservedStock());

        if (reserved < quantity) {
            throw new IllegalStateException("Cannot release more stock than reserved");
        }

        item.setReservedStock(reserved - quantity);
        item.setAvailableStock(safeAdd(safeStock(item.getAvailableStock()), quantity));
        inventoryItemRepository.save(item);
    }

    @Override
    public void deductStock(Long warehouseId, Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Deduction quantity");
        InventoryItem item = getLockedItem(warehouseId, productVariantId);
        int reserved = safeStock(item.getReservedStock());

        if (reserved < quantity) {
            throw new IllegalStateException("Cannot deduct more stock than reserved");
        }

        item.setReservedStock(reserved - quantity);
        inventoryItemRepository.save(item);
    }

    @Override
    public void restoreStock(Long warehouseId, Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Restore quantity");
        InventoryItem item = getLockedItem(warehouseId, productVariantId);
        item.setAvailableStock(safeAdd(safeStock(item.getAvailableStock()), quantity));
        inventoryItemRepository.save(item);
    }

    // -------------------------------------------------------------------------
    // Backward-compatible methods used by the current OrderServiceImpl.
    // -------------------------------------------------------------------------

    @Override
    public void reserveStock(Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Reservation quantity");
        InventoryItem item = findLockedItemWithAvailableStock(productVariantId, quantity);
        item.setAvailableStock(safeStock(item.getAvailableStock()) - quantity);
        item.setReservedStock(safeAdd(safeStock(item.getReservedStock()), quantity));
        inventoryItemRepository.save(item);
    }

    @Override
    public void releaseStock(Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Release quantity");
        InventoryItem item = findLockedItemWithReservedStock(productVariantId, quantity);
        item.setReservedStock(safeStock(item.getReservedStock()) - quantity);
        item.setAvailableStock(safeAdd(safeStock(item.getAvailableStock()), quantity));
        inventoryItemRepository.save(item);
    }

    @Override
    public void deductStock(Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Deduction quantity");
        InventoryItem item = findLockedItemWithReservedStock(productVariantId, quantity);
        item.setReservedStock(safeStock(item.getReservedStock()) - quantity);
        inventoryItemRepository.save(item);
    }

    @Override
    public void addStock(Long productVariantId, Integer quantity) {
        restoreStock(productVariantId, quantity);
    }

    @Override
    public void restoreStock(Long productVariantId, Integer quantity) {
        validatePositiveQuantity(quantity, "Restore quantity");
        InventoryItem item = findLockedItem(productVariantId);
        item.setAvailableStock(safeAdd(safeStock(item.getAvailableStock()), quantity));
        inventoryItemRepository.save(item);
    }

    private InventoryItem getLockedItem(Long warehouseId, Long productVariantId) {
        validateId(warehouseId, "Warehouse id");
        validateId(productVariantId, "Product variant id");

        Inventory inventory = inventoryRepository.findByWarehouseIdForUpdate(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inventory not found for warehouse: " + warehouseId));

        return inventoryItemRepository
                .findByInventoryIdAndProductVariantIdForUpdate(
                        inventory.getId(), productVariantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Product variant is not available in this warehouse"));
    }

    private InventoryItem findLockedItem(Long productVariantId) {
        validateId(productVariantId, "Product variant id");

        List<InventoryItem> items = inventoryItemRepository
                .findByProductVariantId(productVariantId);

        if (items.isEmpty()) {
            throw new IllegalArgumentException(
                    "Inventory not found for product variant: " + productVariantId);
        }

        InventoryItem first = items.get(0);
        return inventoryItemRepository
                .findByInventoryIdAndProductVariantIdForUpdate(
                        first.getInventory().getId(), productVariantId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inventory item not found for product variant: " + productVariantId));
    }

    private InventoryItem findLockedItemWithAvailableStock(
            Long productVariantId, Integer quantity) {

        validateId(productVariantId, "Product variant id");

        for (InventoryItem item : inventoryItemRepository.findByProductVariantId(productVariantId)) {
            InventoryItem locked = inventoryItemRepository
                    .findByInventoryIdAndProductVariantIdForUpdate(
                            item.getInventory().getId(), productVariantId)
                    .orElse(null);

            if (locked != null && safeStock(locked.getAvailableStock()) >= quantity) {
                return locked;
            }
        }

        throw new IllegalStateException(
                "Insufficient stock for product variant: " + productVariantId);
    }

    private InventoryItem findLockedItemWithReservedStock(
            Long productVariantId, Integer quantity) {

        validateId(productVariantId, "Product variant id");

        for (InventoryItem item : inventoryItemRepository.findByProductVariantId(productVariantId)) {
            InventoryItem locked = inventoryItemRepository
                    .findByInventoryIdAndProductVariantIdForUpdate(
                            item.getInventory().getId(), productVariantId)
                    .orElse(null);

            if (locked != null && safeStock(locked.getReservedStock()) >= quantity) {
                return locked;
            }
        }

        throw new IllegalStateException(
                "Reserved inventory not found for product variant: " + productVariantId);
    }

    private Seller getSellerByUserId(Long userId) {
        validateId(userId, "User id");
        return sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Seller profile not found"));
    }

    private void verifyWarehouseOwnership(Warehouse warehouse, Seller seller) {
        if (warehouse == null || warehouse.getSeller() == null
                || !warehouse.getSeller().getId().equals(seller.getId())) {
            throw new IllegalArgumentException("Warehouse does not belong to seller");
        }
    }

    private InventoryResponse mapToResponse(Inventory inventory) {
        List<InventoryItemResponse> items =
                inventoryItemRepository.findByInventoryId(inventory.getId())
                        .stream()
                        .map(this::mapItem)
                        .toList();

        return InventoryResponse.builder()
                .id(inventory.getId())
                .warehouseId(inventory.getWarehouse().getId())
                .warehouseName(inventory.getWarehouse().getWarehouseName())
                .items(items)
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    private InventoryItemResponse mapItem(InventoryItem item) {
        int available = safeStock(item.getAvailableStock());
        int reserved = safeStock(item.getReservedStock());

        return InventoryItemResponse.builder()
                .id(item.getId())
                .productVariantId(item.getProductVariant().getId())
                .sku(item.getProductVariant().getSku())
                .availableStock(available)
                .reservedStock(reserved)
                .totalStock(safeAdd(available, reserved))
                .stockStatus(available > 0 ? "IN_STOCK" : "OUT_OF_STOCK")
                .build();
    }

    private void validateId(Long id, String fieldName) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than zero");
        }
    }

    private void validateNonNegativeQuantity(Integer quantity, String fieldName) {
        if (quantity == null || quantity < 0) {
            throw new IllegalArgumentException(fieldName + " cannot be negative");
        }
    }

    private void validatePositiveQuantity(Integer quantity, String fieldName) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than zero");
        }
    }

    private int safeStock(Integer stock) {
        return stock == null ? 0 : stock;
    }

    private int safeAdd(int current, int quantity) {
        long result = (long) current + quantity;
        if (result > Integer.MAX_VALUE) {
            throw new IllegalArgumentException("Stock quantity exceeds maximum allowed value");
        }
        return (int) result;
    }
}
