package com.nextcart.nextcart.auth_module.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class Msg91WidgetService {

    private static final String VERIFY_ACCESS_TOKEN_URL =
            "https://control.msg91.com/api/v5/widget/verifyAccessToken";

    private final RestClient restClient;
    private final String authKey;

    public Msg91WidgetService(
            @Value("${msg91.auth-key}") String authKey
    ) {
        this.authKey = authKey;
        this.restClient = RestClient.create();
    }

    /**
     * Verifies the access token returned by MSG91 Widget.
     *
     * @param accessToken token received from MSG91 Widget
     * @return true when MSG91 confirms successful verification
     */
    public boolean verifyAccessToken(String accessToken) {

        // ---------------------------------------------------------
        // 1. Validate access token
        // ---------------------------------------------------------
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalArgumentException(
                    "MSG91 access token is required"
            );
        }

        // ---------------------------------------------------------
        // 2. Validate MSG91 auth key
        // ---------------------------------------------------------
        if (authKey == null || authKey.isBlank()) {
            throw new IllegalStateException(
                    "MSG91 auth key is not configured"
            );
        }

        // ---------------------------------------------------------
        // 3. Prepare request body
        // ---------------------------------------------------------
        Map<String, Object> requestBody = Map.of(
                "authkey", authKey,
                "access-token", accessToken.trim()
        );

        try {

            // -----------------------------------------------------
            // 4. Call MSG91 Widget access-token verification API
            // -----------------------------------------------------
            Map<?, ?> response = restClient
                    .post()
                    .uri(VERIFY_ACCESS_TOKEN_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            // -----------------------------------------------------
            // 5. Log complete MSG91 response
            // -----------------------------------------------------
            System.out.println("==============================================");
            System.out.println("MSG91 WIDGET ACCESS TOKEN VERIFICATION");
            System.out.println("==============================================");
            System.out.println("Response: " + response);

            if (response == null || response.isEmpty()) {

                System.out.println("MSG91 RESPONSE: EMPTY");

                System.out.println("==============================================");

                return false;
            }

            // -----------------------------------------------------
            // 6. Extract response fields
            // -----------------------------------------------------
            Object type = response.get("type");
            Object message = response.get("message");
            Object code = response.get("code");

            System.out.println("MSG91 TYPE    : " + type);
            System.out.println("MSG91 MESSAGE : " + message);
            System.out.println("MSG91 CODE    : " + code);
            System.out.println("==============================================");

            // -----------------------------------------------------
            // 7. Check successful response
            // -----------------------------------------------------
            return "success".equalsIgnoreCase(
                    String.valueOf(type)
            );

        } catch (Exception ex) {

            System.out.println("==============================================");
            System.out.println("MSG91 WIDGET VERIFICATION EXCEPTION");
            System.out.println("==============================================");
            System.out.println("Exception : " + ex.getClass().getName());
            System.out.println("Message   : " + ex.getMessage());
            System.out.println("==============================================");

            throw new IllegalStateException(
                    "Unable to verify MSG91 Widget access token",
                    ex
            );
        }
    }
}