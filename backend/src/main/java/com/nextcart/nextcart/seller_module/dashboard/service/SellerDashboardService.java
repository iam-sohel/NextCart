package com.nextcart.nextcart.seller_module.dashboard.service;

import com.nextcart.nextcart.seller_module.dashboard.dto.SellerDashboardResponse;

public interface SellerDashboardService {

    SellerDashboardResponse getMyDashboard(Long userId);
}
