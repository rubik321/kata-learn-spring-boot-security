package ru.kata.spring.boot_security.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.kata.spring.boot_security.demo.model.User;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/auth")
public class SecurityRestController {

    @GetMapping("/principal")
    public ResponseEntity<User> getPrincipal() {
        Object user = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user.getClass() == String.class) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } else {
            return ResponseEntity.ok((User) user);
        }
    }
}
