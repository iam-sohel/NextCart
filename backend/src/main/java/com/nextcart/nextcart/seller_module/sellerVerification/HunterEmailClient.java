package com.nextcart.nextcart.seller_module.sellerVerification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class HunterEmailClient implements EmailValidationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${seller.verification.hunter.base-url}")
    private String baseUrl;

    @Value("${seller.verification.hunter.api-key:}")
    private String apiKey;


    // =========================================================
    // EMAIL VERIFICATION
    // =========================================================

    @Override
    public EmailVerificationResult verify(String email) {

        // -----------------------------------------------------
        // CREDENTIAL CHECK
        // -----------------------------------------------------

        if (apiKey == null || apiKey.isBlank()) {

            return new EmailVerificationResult(
                    false,
                    "NOT_CONFIGURED",
                    null,
                    null,
                    null,
                    null,
                    "Email verification service is not configured"
            );
        }


        // -----------------------------------------------------
        // INPUT VALIDATION
        // -----------------------------------------------------

        if (email == null || email.isBlank()) {

            return new EmailVerificationResult(
                    false,
                    "INVALID_REQUEST",
                    null,
                    null,
                    false,
                    null,
                    "Email is required"
            );
        }


        String normalizedEmail =
                email.trim().toLowerCase();


        try {

            // -------------------------------------------------
            // BUILD URL
            // -------------------------------------------------

            String url =
                    UriComponentsBuilder
                            .fromUriString(
                                    baseUrl + "/email-verifier"
                            )
                            .queryParam(
                                    "email",
                                    normalizedEmail
                            )
                            .queryParam(
                                    "api_key",
                                    apiKey
                            )
                            .toUriString();


            // -------------------------------------------------
            // API CALL
            // -------------------------------------------------

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            null,
                            String.class
                    );


            // -------------------------------------------------
            // PARSE RESPONSE
            // -------------------------------------------------

            return parseResponse(
                    response.getBody()
            );

        } catch (Exception ex) {

            return new EmailVerificationResult(
                    false,
                    "ERROR",
                    null,
                    null,
                    null,
                    null,
                    "Email verification service failed"
            );
        }
    }


    // =========================================================
    // RESPONSE PARSER
    // =========================================================

    private EmailVerificationResult parseResponse(
            String responseBody
    ) {

        if (responseBody == null
                || responseBody.isBlank()) {

            return new EmailVerificationResult(
                    false,
                    "ERROR",
                    null,
                    null,
                    null,
                    null,
                    "Empty response received from email verification service"
            );
        }


        try {

            JsonNode root =
                    objectMapper.readTree(
                            responseBody
                    );

            JsonNode data =
                    root.path("data");


            // -------------------------------------------------
            // STATUS
            // -------------------------------------------------

            String status =
                    extractString(
                            data,
                            "status"
                    );


            // -------------------------------------------------
            // SCORE
            // -------------------------------------------------

            Integer score =
                    extractInteger(
                            data,
                            "score"
                    );


            // -------------------------------------------------
            // DISPOSABLE
            // -------------------------------------------------

            Boolean disposable =
                    extractBoolean(
                            data,
                            "disposable"
                    );


            // -------------------------------------------------
            // RESULT
            // -------------------------------------------------

            String result =
                    extractString(
                            data,
                            "result"
                    );


            // -------------------------------------------------
            // VALID
            // -------------------------------------------------

            Boolean valid =
                    isValidStatus(
                            status
                    );


            // -------------------------------------------------
            // MESSAGE
            // -------------------------------------------------

            String message =
                    extractString(
                            root,
                            "message"
                    );


            // -------------------------------------------------
            // PIPELINE RULES
            // -------------------------------------------------

            /*
             * disposable == true
             * -----------------
             * Reject immediately.
             */

            if (Boolean.TRUE.equals(disposable)) {

                return new EmailVerificationResult(
                        false,
                        "FAILED",
                        score,
                        disposable,
                        valid,
                        result,
                        "Disposable email address detected"
                );
            }


            /*
             * status == invalid
             * -----------------
             * Reject.
             */

            if ("invalid".equalsIgnoreCase(status)) {

                return new EmailVerificationResult(
                        false,
                        "FAILED",
                        score,
                        disposable,
                        false,
                        result,
                        "Email address is invalid"
                );
            }


            /*
             * score < 50
             * -----------
             * Challenge / manual review.
             */

            if (score != null && score < 50) {

                return new EmailVerificationResult(
                        false,
                        "REVIEW",
                        score,
                        disposable,
                        valid,
                        result,
                        "Email verification score is below the accepted threshold"
                );
            }


            /*
             * score >= 80 AND valid
             * --------------------
             * Passed.
             */

            if (Boolean.TRUE.equals(valid)
                    && score != null
                    && score >= 80) {

                return new EmailVerificationResult(
                        true,
                        "PASSED",
                        score,
                        disposable,
                        true,
                        result,
                        message != null
                                ? message
                                : "Email verification passed"
                );
            }


            /*
             * Other responses require review.
             */

            return new EmailVerificationResult(
                    false,
                    "REVIEW",
                    score,
                    disposable,
                    valid,
                    result,
                    message != null
                            ? message
                            : "Email verification requires review"
            );

        } catch (Exception ex) {

            return new EmailVerificationResult(
                    false,
                    "ERROR",
                    null,
                    null,
                    null,
                    null,
                    "Unable to parse email verification response"
            );
        }
    }


    // =========================================================
    // STATUS VALIDATION
    // =========================================================

    private Boolean isValidStatus(
            String status
    ) {

        if (status == null) {
            return false;
        }

        return "valid".equalsIgnoreCase(status)
                || "deliverable".equalsIgnoreCase(status);
    }


    // =========================================================
    // BOOLEAN EXTRACTION
    // =========================================================

    private Boolean extractBoolean(
            JsonNode node,
            String field
    ) {

        if (node == null
                || node.isMissingNode()
                || node.isNull()) {

            return null;
        }


        JsonNode value =
                node.path(field);


        if (value.isMissingNode()
                || value.isNull()) {

            return null;
        }


        if (value.isBoolean()) {
            return value.asBoolean();
        }


        String text =
                value.asText();


        if ("true".equalsIgnoreCase(text)) {
            return true;
        }

        if ("false".equalsIgnoreCase(text)) {
            return false;
        }


        return null;
    }


    // =========================================================
    // INTEGER EXTRACTION
    // =========================================================

    private Integer extractInteger(
            JsonNode node,
            String field
    ) {

        if (node == null
                || node.isMissingNode()
                || node.isNull()) {

            return null;
        }


        JsonNode value =
                node.path(field);


        if (value.isMissingNode()
                || value.isNull()) {

            return null;
        }


        if (value.isInt()
                || value.isLong()) {

            return value.asInt();
        }


        try {

            return Integer.parseInt(
                    value.asText()
            );

        } catch (NumberFormatException ex) {

            return null;
        }
    }


    // =========================================================
    // STRING EXTRACTION
    // =========================================================

    private String extractString(
            JsonNode node,
            String field
    ) {

        if (node == null
                || node.isMissingNode()
                || node.isNull()) {

            return null;
        }


        JsonNode value =
                node.path(field);


        if (value.isMissingNode()
                || value.isNull()) {

            return null;
        }


        String text =
                value.asText();


        return text.isBlank()
                ? null
                : text;
    }
}