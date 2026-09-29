package com.gesmio.havlook.seller_module.analytics.service;

import com.gesmio.havlook.seller_module.analytics.dto.SellerAnalyticsResponse;

import java.time.LocalDate;

public interface SellerAnalyticsService {

    SellerAnalyticsResponse getAnalytics(
            Long sellerId,
            LocalDate from,
            LocalDate to
    );
}