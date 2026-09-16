package com.nextcart.nextcart.admin_module;

import com.nextcart.nextcart.admin_module.AdminSellerService;
import com.nextcart.nextcart.seller_module.seller.dto.SellerResponse;
import com.nextcart.nextcart.seller_module.seller.entity.Seller;
import com.nextcart.nextcart.seller_module.seller.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSellerServiceImpl implements AdminSellerService {

    private final SellerRepository sellerRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<SellerResponse> getAllSellers(Pageable pageable) {

        return sellerRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SellerResponse getSellerById(Long sellerId) {

        Seller seller = getSeller(sellerId);

        return mapToResponse(seller);
    }

    @Override
    public void activateSeller(Long sellerId) {

        Seller seller = getSeller(sellerId);

        if (!seller.isActive()) {
            seller.setActive(true);
            sellerRepository.save(seller);
        }
    }

    @Override
    public void deactivateSeller(Long sellerId) {

        Seller seller = getSeller(sellerId);

        if (seller.isActive()) {
            seller.setActive(false);
            sellerRepository.save(seller);
        }
    }

    private Seller getSeller(Long sellerId) {

        return sellerRepository.findById(sellerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Seller not found with id: " + sellerId
                        )
                );
    }

    private SellerResponse mapToResponse(Seller seller) {

        return SellerResponse.builder()
                .sellerId(seller.getId())
                .userId(seller.getUser().getId())
                .firstName(seller.getUser().getFirstName())
                .lastName(seller.getUser().getLastName())
                .email(seller.getUser().getEmail())
                .phone(seller.getUser().getPhone())
                .businessName(seller.getBusinessName())
                .gstNumber(seller.getGstNumber())
                .verified(seller.isVerified())
                .active(seller.isActive())
                .build();
    }
}