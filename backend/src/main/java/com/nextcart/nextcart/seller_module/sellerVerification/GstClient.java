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
public class GstClient implements GstService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${seller.verification.gst.base-url}")
    private String baseUrl;


    // =========================================================
    // GST VERIFICATION
    // =========================================================

    @Override
    public GstService.GstVerificationResult verify(String gstin) {

        // -----------------------------------------------------
        // INPUT VALIDATION
        // -----------------------------------------------------

        if (gstin == null || gstin.isBlank()) {

            return new GstService.GstVerificationResult(
                    false,
                    "INVALID_REQUEST",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "GSTIN is required"
            );
        }

        String normalizedGstin =
                gstin.trim().toUpperCase();


        // -----------------------------------------------------
        // BASIC GSTIN FORMAT VALIDATION
        // -----------------------------------------------------

        if (!normalizedGstin.matches(
                "^[0-9A-Z]{15}$"
        )) {

            return new GstService.GstVerificationResult(
                    false,
                    "INVALID_REQUEST",
                    normalizedGstin,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Invalid GSTIN format"
            );
        }


        try {

            // -------------------------------------------------
            // BUILD URL
            // -------------------------------------------------

            String url =
                    UriComponentsBuilder
                            .fromUriString(
                                    baseUrl
                                            + "/gstin/"
                                            + normalizedGstin
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
                    response.getBody(),
                    normalizedGstin
            );

        } catch (Exception ex) {

            return new GstService.GstVerificationResult(
                    false,
                    "ERROR",
                    normalizedGstin,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "GST verification service failed"
            );
        }
    }


    // =========================================================
    // RESPONSE PARSER
    // =========================================================

    private GstService.GstVerificationResult parseResponse(
            String responseBody,
            String requestedGstin
    ) {

        if (responseBody == null
                || responseBody.isBlank()) {

            return new GstService.GstVerificationResult(
                    false,
                    "ERROR",
                    requestedGstin,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Empty response received from GST verification service"
            );
        }


        try {

            JsonNode root =
                    objectMapper.readTree(
                            responseBody
                    );


            // -------------------------------------------------
            // ENRICHMENT / ONLINE PROVIDER DETAILS
            // -------------------------------------------------

            JsonNode details =
                    root.path("enrichment_details")
                            .path("online_provider")
                            .path("details");


            /*
             * Some gateways may return the details directly
             * under data. Support that structure as well.
             */

            if (details.isMissingNode()
                    || details.isNull()
                    || details.isEmpty()) {

                details =
                        root.path("data")
                                .path("enrichment_details")
                                .path("online_provider")
                                .path("details");
            }


            // -------------------------------------------------
            // GSTIN
            // -------------------------------------------------

            String gstin =
                    extractValue(
                            details,
                            "gstin"
                    );

            if (gstin == null) {

                gstin =
                        extractString(
                                root,
                                "gstin"
                        );
            }

            if (gstin == null) {
                gstin = requestedGstin;
            }


            // -------------------------------------------------
            // STATUS
            // -------------------------------------------------

            String status =
                    extractValue(
                            details,
                            "status"
                    );

            if (status == null) {

                status =
                        extractString(
                                root,
                                "status"
                        );
            }


            // -------------------------------------------------
            // LEGAL NAME
            // -------------------------------------------------

            String legalName =
                    extractValue(
                            details,
                            "legal_name"
                    );


            // -------------------------------------------------
            // TRADE NAME
            // -------------------------------------------------

            String tradeName =
                    extractValue(
                            details,
                            "trade_name"
                    );


            // -------------------------------------------------
            // CONSTITUTION
            // -------------------------------------------------

            String constitution =
                    extractValue(
                            details,
                            "constitution"
                    );


            // -------------------------------------------------
            // TAXPAYER TYPE
            // -------------------------------------------------

            String taxPayerType =
                    extractValue(
                            details,
                            "tax_payer_type"
                    );


            // -------------------------------------------------
            // REGISTRATION DATE
            // -------------------------------------------------

            String registrationDate =
                    extractValue(
                            details,
                            "registration_date"
                    );


            // -------------------------------------------------
            // PRIMARY ADDRESS
            // -------------------------------------------------

            String primaryAddress =
                    extractValue(
                            details,
                            "primary_address"
                    );


            // -------------------------------------------------
            // GST VERIFICATION RULE
            // -------------------------------------------------

            boolean passed =
                    "Active".equalsIgnoreCase(
                            status
                    );


            if (passed) {

                return new GstService.GstVerificationResult(
                        true,
                        "PASSED",
                        gstin,
                        legalName,
                        tradeName,
                        constitution,
                        taxPayerType,
                        registrationDate,
                        primaryAddress,
                        "GST verification passed"
                );
            }


            // -------------------------------------------------
            // FAILED
            // -------------------------------------------------

            return new GstService.GstVerificationResult(
                    false,
                    "FAILED",
                    gstin,
                    legalName,
                    tradeName,
                    constitution,
                    taxPayerType,
                    registrationDate,
                    primaryAddress,
                    status == null
                            ? "GST status could not be verified"
                            : "GST status is not Active"
            );

        } catch (Exception ex) {

            return new GstService.GstVerificationResult(
                    false,
                    "ERROR",
                    requestedGstin,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Unable to parse GST verification response"
            );
        }
    }


    // =========================================================
    // VALUE EXTRACTION
    // =========================================================

    private String extractValue(
            JsonNode node,
            String field
    ) {

        if (node == null
                || node.isMissingNode()
                || node.isNull()) {

            return null;
        }


        JsonNode fieldNode =
                node.path(field);


        if (fieldNode.isMissingNode()
                || fieldNode.isNull()) {

            return null;
        }


        /*
         * PDF response structure uses:
         *
         * "status": {
         *     "value": "Active"
         * }
         */

        if (fieldNode.isObject()) {

            JsonNode valueNode =
                    fieldNode.path("value");

            if (!valueNode.isMissingNode()
                    && !valueNode.isNull()) {

                String value =
                        valueNode.asText();

                return value.isBlank()
                        ? null
                        : value;
            }
        }


        String value =
                fieldNode.asText();


        return value.isBlank()
                ? null
                : value;
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