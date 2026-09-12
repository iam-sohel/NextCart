package com.nextcart.nextcart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class NextCartApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                NextCartApplication.class,
                args
        );
    }
}