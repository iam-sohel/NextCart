package com.nextcart.nextcart.user_module.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

@GetMapping("/me")
public String currentUser() {
    return "Authenticated User";
}
}