package com.nextcart.nextcart.auth_module.service;

public interface SmsService {

    void sendOtp(String phone, String otp);
}