package ru.kata.spring.boot_security.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.kata.spring.boot_security.demo.model.User;

@RestController
@RequestMapping("api/v1/user")
public class UserRestController {

    @GetMapping
    public ResponseEntity<User> getUser() {
        Object user = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user.getClass() == String.class) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } else {
            return ResponseEntity.ok((User) user);
        }
    }
}
