package com.gesmio.havlook.seller_module.dashboard.service;

import com.gesmio.havlook.seller_module.dashboard.dto.SellerDashboardResponse;

public interface SellerDashboardService {

    SellerDashboardResponse getMyDashboard(Long userId);
}
