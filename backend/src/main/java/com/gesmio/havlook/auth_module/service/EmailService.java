package com.gesmio.havlook.auth_module.service;

public interface EmailService {

    void sendEmail(
            String to,
            String subject,
            String body
    );
}