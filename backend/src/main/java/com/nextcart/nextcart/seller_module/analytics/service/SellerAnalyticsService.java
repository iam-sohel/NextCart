package com.nextcart.nextcart.seller_module.analytics.service;

import com.nextcart.nextcart.seller_module.analytics.dto.SellerAnalyticsResponse;

import java.time.LocalDate;

public interface SellerAnalyticsService {

    SellerAnalyticsResponse getAnalytics(
            Long sellerId,
            LocalDate from,
            LocalDate to
    );
}