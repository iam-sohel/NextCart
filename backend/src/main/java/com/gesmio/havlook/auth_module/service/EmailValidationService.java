package com.gesmio.havlook.auth_module.service;

import com.gesmio.havlook.auth_module.dto.EmailValidationResult;

public interface EmailValidationService {

    EmailValidationResult validate(String email);
}