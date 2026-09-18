package com.nextcart.nextcart.seller_module.sellerVerification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SandboxPanClient implements PanKycService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${seller.verification.sandbox.base-url}")
    private String baseUrl;

    @Value("${seller.verification.sandbox.api-key:}")
    private String apiKey;

    @Value("${seller.verification.sandbox.api-secret:}")
    private String apiSecret;

    /**
     * Cached Sandbox access token.
     */
    private volatile String accessToken;


    // =========================================================
    // PAN VERIFICATION
    // =========================================================

    @Override
    public PanKycService.PanVerificationResult verify(String panNumber, String name, LocalDate dateOfBirth) {

        // -----------------------------------------------------
        // CREDENTIAL CHECK
        // -----------------------------------------------------

        if (apiKey == null || apiKey.isBlank() || apiSecret == null || apiSecret.isBlank()) {

            return new PanKycService.PanVerificationResult(false, "NOT_CONFIGURED", null, null, null, "PAN verification service is not configured");
        }


        // -----------------------------------------------------
        // INPUT CHECK
        // -----------------------------------------------------

        if (panNumber == null || panNumber.isBlank()) {

            return new PanKycService.PanVerificationResult(false, "INVALID_REQUEST", null, null, null, "PAN number is required");
        }

        if (name == null || name.isBlank()) {

            return new PanKycService.PanVerificationResult(false, "INVALID_REQUEST", null, null, null, "Name is required");
        }

        if (dateOfBirth == null) {

            return new PanKycService.PanVerificationResult(false, "INVALID_REQUEST", null, null, null, "Date of birth is required");
        }


        try {

            String token = getAccessToken();

            return executePanVerification(panNumber.trim().toUpperCase(), name.trim(), dateOfBirth, token);

        } catch (Exception ex) {

            return new PanKycService.PanVerificationResult(false, "ERROR", null, null, null, "PAN verification service failed");
        }
    }


    // =========================================================
    // PAN API REQUEST
    // =========================================================

    private PanKycService.PanVerificationResult executePanVerification(String panNumber, String name, LocalDate dateOfBirth, String token) {

        String url = baseUrl + "/kyc/pan/verify";

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.set("x-api-key", apiKey);

        headers.set(HttpHeaders.AUTHORIZATION, token);


        // -----------------------------------------------------
        // REQUEST BODY
        // -----------------------------------------------------

        Map<String, Object> requestBody = new HashMap<>();

        requestBody.put("pan", panNumber);

        requestBody.put("name_as_per_pan", name);

        requestBody.put("date_of_birth", dateOfBirth.toString());

        /*
         * Sandbox requires explicit consent.
         */
        requestBody.put("consent", "Y");

        requestBody.put("reason", "For seller onboarding verification");


        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);


        // -----------------------------------------------------
        // API CALL
        // -----------------------------------------------------

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return parsePanResponse(response.getBody());
    }


    // =========================================================
    // SANDBOX AUTHENTICATION
    // =========================================================

    private synchronized String getAccessToken() {

        // -----------------------------------------------------
        // USE CACHED TOKEN
        // -----------------------------------------------------

        if (accessToken != null && !accessToken.isBlank()) {

            return accessToken;
        }


        String url = baseUrl + "/authenticate";


        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.set("x-api-key", apiKey);

        headers.set("x-api-secret", apiSecret);


        HttpEntity<Void> request = new HttpEntity<>(headers);


        // -----------------------------------------------------
        // AUTHENTICATE
        // -----------------------------------------------------

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);


        try {

            JsonNode root = objectMapper.readTree(response.getBody());


            String token = extractAccessToken(root);


            if (token == null || token.isBlank()) {

                throw new IllegalStateException("Sandbox access token not found");
            }


            accessToken = token;

            return accessToken;

        } catch (Exception ex) {

            throw new IllegalStateException("Failed to authenticate with Sandbox", ex);
        }
    }


    // =========================================================
    // ACCESS TOKEN EXTRACTION
    // =========================================================

    private String extractAccessToken(JsonNode root) {

        // -----------------------------------------------------
        // data.access_token
        // -----------------------------------------------------

        JsonNode tokenNode = root.path("data").path("access_token");


        if (!tokenNode.isMissingNode() && !tokenNode.isNull()) {

            return tokenNode.asText();
        }


        // -----------------------------------------------------
        // root.access_token
        // -----------------------------------------------------

        tokenNode = root.path("access_token");


        if (!tokenNode.isMissingNode() && !tokenNode.isNull()) {

            return tokenNode.asText();
        }


        return null;
    }


    // =========================================================
    // PAN RESPONSE
    // =========================================================

    private PanKycService.PanVerificationResult parsePanResponse(String responseBody) {

        if (responseBody == null || responseBody.isBlank()) {

            return new PanKycService.PanVerificationResult(false, "ERROR", null, null, null, "Empty response received from PAN verification service");
        }


        try {

            JsonNode root = objectMapper.readTree(responseBody);


            // -------------------------------------------------
            // STATUS
            // -------------------------------------------------

            String status = root.path("code").asText();


            if (status.isBlank()) {

                status = root.path("status").asText();
            }


            // -------------------------------------------------
            // DATA
            // -------------------------------------------------

            JsonNode data = root.path("data");


            // -------------------------------------------------
            // NAME MATCH
            // -------------------------------------------------

            Boolean nameMatch = extractBoolean(data, "name_as_per_pan");


            // -------------------------------------------------
            // DOB MATCH
            // -------------------------------------------------

            Boolean dateOfBirthMatch = extractBoolean(data, "date_of_birth");


            // -------------------------------------------------
            // TRANSACTION ID
            // -------------------------------------------------

            String transactionId = extractString(root, "transaction_id");


            if (transactionId == null) {

                transactionId = extractString(data, "transaction_id");
            }


            // -------------------------------------------------
            // MESSAGE
            // -------------------------------------------------

            String message = extractString(root, "message");


            // -------------------------------------------------
            // RESULT
            // -------------------------------------------------

            boolean passed = isSuccessfulStatus(status) && Boolean.TRUE.equals(nameMatch) && Boolean.TRUE.equals(dateOfBirthMatch);


            return new PanKycService.PanVerificationResult(passed, passed ? "PASSED" : "FAILED", nameMatch, dateOfBirthMatch, transactionId, message);

        } catch (Exception ex) {

            return new PanKycService.PanVerificationResult(false, "ERROR", null, null, null, "Unable to parse PAN verification response");
        }
    }


    // =========================================================
    // STATUS CHECK
    // =========================================================

    private boolean isSuccessfulStatus(String status) {

        if (status == null) {
            return false;
        }

        return "200".equals(status) || "SUCCESS".equalsIgnoreCase(status) || "success".equalsIgnoreCase(status) || "VALID".equalsIgnoreCase(status);
    }


    // =========================================================
    // BOOLEAN EXTRACTION
    // =========================================================

    private Boolean extractBoolean(JsonNode node, String field) {

        if (node == null || node.isMissingNode() || node.isNull()) {

            return null;
        }


        JsonNode value = node.path(field);


        if (value.isMissingNode() || value.isNull()) {

            return null;
        }


        // -----------------------------------------------------
        // BOOLEAN
        // -----------------------------------------------------

        if (value.isBoolean()) {

            return value.asBoolean();
        }


        // -----------------------------------------------------
        // STRING
        // -----------------------------------------------------

        String text = value.asText();


        if ("true".equalsIgnoreCase(text) || "yes".equalsIgnoreCase(text) || "matched".equalsIgnoreCase(text)) {

            return true;
        }


        if ("false".equalsIgnoreCase(text) || "no".equalsIgnoreCase(text) || "not_matched".equalsIgnoreCase(text)) {

            return false;
        }


        return null;
    }


    // =========================================================
    // STRING EXTRACTION
    // =========================================================

    private String extractString(JsonNode node, String field) {

        if (node == null || node.isMissingNode() || node.isNull()) {

            return null;
        }


        JsonNode value = node.path(field);


        if (value.isMissingNode() || value.isNull()) {

            return null;
        }


        String text = value.asText();


        return text.isBlank() ? null : text;
    }
}