package com.gesmio.havlook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class HavlookApplication {

    public static void main(String[]   args) {
        SpringApplication.run(
                HavlookApplication.class,
                args
        );
    }
}