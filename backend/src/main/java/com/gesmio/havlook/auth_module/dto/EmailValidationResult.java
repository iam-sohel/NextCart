package com.gesmio.havlook.auth_module.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmailValidationResult {

    private boolean valid;
    private boolean disposable;
    private boolean risky;
    private boolean mxFound;

    private String status;
    private String subStatus;
    private String message;
}