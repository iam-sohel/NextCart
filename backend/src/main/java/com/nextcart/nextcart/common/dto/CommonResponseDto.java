package com.nextcart.nextcart.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommonResponseDto<T> {

    private boolean success;

    private String message;

    private T data;

    private String errorCode;

    private LocalDateTime timestamp;

    public CommonResponseDto(
            boolean success,
            String message,
            T data
    ) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public CommonResponseDto(
            boolean success,
            String message,
            T data,
            String errorCode
    ) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }
}