package com.nextcart.nextcart.auth_module.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsServiceImpl implements SmsService {

    @Override
    public void sendOtp(String phone, String otp) {

        /*
         * SMS provider integration will be added here.
         *
         * For production, connect this service to an SMS provider
         * such as MSG91, Twilio, or AWS SNS.
         *
         * Do NOT log the OTP in production.
         */

        log.info("SMS OTP request received for phone ending with {}",
                maskPhone(phone));
    }

    private String maskPhone(String phone) {

        if (phone == null || phone.length() < 4) {
            return "****";
        }

        return "******" + phone.substring(phone.length() - 4);
    }
}