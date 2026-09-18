
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
public class NumverifyPhoneClient implements PhoneVerificationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${seller.verification.numverify.base-url}")
    private String baseUrl;

    @Value("${seller.verification.numverify.access-key:}")
    private String accessKey;


    // =========================================================
    // PHONE VERIFICATION
    // =========================================================

    @Override
    public PhoneVerificationResult verify(
            String phoneNumber,
            String countryCode
    ) {

        // -----------------------------------------------------
        // CREDENTIAL CHECK
        // -----------------------------------------------------

        if (accessKey == null || accessKey.isBlank()) {

            return new PhoneVerificationResult(
                    false,
                    "NOT_CONFIGURED",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Mobile verification service is not configured"
            );
        }


        // -----------------------------------------------------
        // INPUT VALIDATION
        // -----------------------------------------------------

        if (phoneNumber == null || phoneNumber.isBlank()) {

            return new PhoneVerificationResult(
                    false,
                    "INVALID_REQUEST",
                    false,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Phone number is required"
            );
        }


        String normalizedPhone =
                phoneNumber.trim();

        String normalizedCountryCode =
                countryCode == null
                        ? null
                        : countryCode.trim().toUpperCase();


        try {

            // -------------------------------------------------
            // BUILD REQUEST URL
            // -------------------------------------------------

            UriComponentsBuilder builder =
                    UriComponentsBuilder
                            .fromUriString(
                                    baseUrl + "/validate"
                            )
                            .queryParam(
                                    "access_key",
                                    accessKey
                            )
                            .queryParam(
                                    "number",
                                    normalizedPhone
                            );

            if (normalizedCountryCode != null
                    && !normalizedCountryCode.isBlank()) {

                builder.queryParam(
                        "country_code",
                        normalizedCountryCode
                );
            }


            String url =
                    builder.toUriString();


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

            return new PhoneVerificationResult(
                    false,
                    "ERROR",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Mobile verification service failed"
            );
        }
    }


    // =========================================================
    // RESPONSE PARSER
    // =========================================================

    private PhoneVerificationResult parseResponse(
            String responseBody
    ) {

        if (responseBody == null
                || responseBody.isBlank()) {

            return new PhoneVerificationResult(
                    false,
                    "ERROR",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Empty response received from mobile verification service"
            );
        }


        try {

            JsonNode root =
                    objectMapper.readTree(
                            responseBody
                    );


            // -------------------------------------------------
            // API ERROR
            // -------------------------------------------------

            JsonNode errorNode =
                    root.path("error");

            if (!errorNode.isMissingNode()
                    && !errorNode.isNull()) {

                String errorMessage =
                        extractString(
                                errorNode,
                                "info"
                        );

                return new PhoneVerificationResult(
                        false,
                        "FAILED",
                        false,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        errorMessage != null
                                ? errorMessage
                                : "Mobile verification API returned an error"
                );
            }


            // -------------------------------------------------
            // VALID
            // -------------------------------------------------

            Boolean valid =
                    extractBoolean(
                            root,
                            "valid"
                    );


            // -------------------------------------------------
            // INTERNATIONAL FORMAT
            // -------------------------------------------------

            String internationalFormat =
                    extractString(
                            root,
                            "international_format"
                    );


            // -------------------------------------------------
            // COUNTRY CODE
            // -------------------------------------------------

            String countryCode =
                    extractString(
                            root,
                            "country_code"
                    );


            // -------------------------------------------------
            // COUNTRY NAME
            // -------------------------------------------------

            String countryName =
                    extractString(
                            root,
                            "country_name"
                    );


            // -------------------------------------------------
            // LOCATION
            // -------------------------------------------------

            String location =
                    extractString(
                            root,
                            "location"
                    );


            // -------------------------------------------------
            // CARRIER
            // -------------------------------------------------

            String carrier =
                    extractString(
                            root,
                            "carrier"
                    );


            // -------------------------------------------------
            // LINE TYPE
            // -------------------------------------------------

            String lineType =
                    extractString(
                            root,
                            "line_type"
                    );


            // -------------------------------------------------
            // VERIFICATION RULE
            // -------------------------------------------------

            boolean passed =
                    Boolean.TRUE.equals(valid)
                            && "mobile".equalsIgnoreCase(
                            lineType
                    );


            // -------------------------------------------------
            // RESULT
            // -------------------------------------------------

            if (passed) {

                return new PhoneVerificationResult(
                        true,
                        "PASSED",
                        valid,
                        internationalFormat,
                        countryCode,
                        countryName,
                        location,
                        carrier,
                        lineType,
                        "Mobile number verification passed"
                );
            }


            // -------------------------------------------------
            // INVALID / NON-MOBILE
            // -------------------------------------------------

            String message;

            if (!Boolean.TRUE.equals(valid)) {

                message =
                        "Phone number is invalid";

            } else if ("voip".equalsIgnoreCase(lineType)) {

                message =
                        "VOIP numbers are not accepted";

            } else if ("landline".equalsIgnoreCase(lineType)) {

                message =
                        "Landline numbers are not accepted";

            } else {

                message =
                        "Phone number is not a supported mobile number";
            }


            return new PhoneVerificationResult(
                    false,
                    "FAILED",
                    valid,
                    internationalFormat,
                    countryCode,
                    countryName,
                    location,
                    carrier,
                    lineType,
                    message
            );

        } catch (Exception ex) {

            return new PhoneVerificationResult(
                    false,
                    "ERROR",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Unable to parse mobile verification response"
            );
        }
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