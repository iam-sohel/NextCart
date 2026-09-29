package com.gesmio.havlook.auth_module.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI havlookOpenAPI() {

        return new OpenAPI()

                // =================================================
                // API INFORMATION
                // =================================================

                .info(new Info()
                        .title("Havlook API")
                        .description(
                                "Havlook E-commerce Backend APIs"
                        )
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Havlook")
                        )
                )

                // =================================================
                // SECURITY SCHEME
                // =================================================

                .components(
                        new Components()
                                .addSecuritySchemes(
                                        SECURITY_SCHEME_NAME,
                                        new SecurityScheme()
                                                .type(
                                                        SecurityScheme.Type.HTTP
                                                )
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                )

                // =================================================
                // SECURITY REQUIREMENT
                // =================================================

                .addSecurityItem(
                        new SecurityRequirement()
                                .addList(
                                        SECURITY_SCHEME_NAME
                                )
                );
    }
}