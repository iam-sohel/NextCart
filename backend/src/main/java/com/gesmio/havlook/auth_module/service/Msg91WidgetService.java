package com.gesmio.havlook.auth_module.service;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class Msg91WidgetService {

    private static final Logger log =
            LoggerFactory.getLogger(Msg91WidgetService.class);

    private static final String VERIFY_ACCESS_TOKEN_URL =
            "https://control.msg91.com/api/v5/widget/verifyAccessToken";

    private final RestClient restClient;
    private final String authKey;

    public Msg91WidgetService(
            @Value("${msg91.auth-key:}") String authKey) {

        this.authKey = authKey;

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();

        JdkClientHttpRequestFactory requestFactory =
                new JdkClientHttpRequestFactory(httpClient);

        requestFactory.setReadTimeout(Duration.ofSeconds(5));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * Verifies the access token returned by the MSG91 Widget.
     *
     * @param accessToken token received from MSG91 Widget
     * @return true only when MSG91 explicitly confirms success
     */
    public boolean verifyAccessToken(String accessToken) {

        // 1. Validate access token
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalArgumentException(
                    "MSG91 access token is required");
        }

        // 2. Validate configuration
        if (authKey == null || authKey.isBlank()) {
            log.error("MSG91 verification is not configured");

            throw new IllegalStateException(
                    "MSG91 verification is not configured");
        }

        // 3. Prepare request body
        Map<String, Object> requestBody = Map.of(
                "authkey", authKey,
                "access-token", accessToken.trim()
        );

        final Map<String, Object> response;

        try {
            // 4. Call MSG91 verification API
            response = restClient.post()
                    .uri(VERIFY_ACCESS_TOKEN_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<
                            Map<String, Object>>() {
                    });

        } catch (RestClientException ex) {

            // Do not log credentials, tokens, response bodies,
            // or raw exception messages.
            log.warn(
                    "MSG91 widget verification request failed; errorType={}",
                    ex.getClass().getSimpleName());

            throw new IllegalStateException(
                    "MSG91 verification service is unavailable");
        }

        // 5. Reject empty responses
        if (response == null || response.isEmpty()) {
            log.warn(
                    "MSG91 widget verification returned an empty response");

            return false;
        }

        // 6. Check provider's explicit success status
        Object type = response.get("type");

        boolean verified = type instanceof String
                && "success".equalsIgnoreCase((String) type);

        if (!verified) {
            log.info(
                    "MSG91 widget token verification was rejected");
        }

        // 7. Return verification result
        return verified;
    }
}
