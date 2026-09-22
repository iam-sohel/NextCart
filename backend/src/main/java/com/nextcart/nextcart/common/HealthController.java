package com.nextcart.nextcart.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        
        response.put("status", "ZINDA_HAI");
        response.put("system_mood", "Full mauj me chal raha hai, tension mat lo!");
        response.put("caffeine_level", "99.9%");
        response.put("bugs_found", 0); // "It's a feature, not a bug" 😉
        response.put("service", "NextCart Backend Engine");
        response.put("timestamp", Instant.now().toString());
        
        return ResponseEntity.ok(response);
    }
}
