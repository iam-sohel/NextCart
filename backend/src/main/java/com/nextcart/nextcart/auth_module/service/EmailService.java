package com.nextcart.nextcart.auth_module.service;

public interface EmailService {

    void sendEmail(
            String to,
            String subject,
            String body
    );
}