package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;

@RestController
@RequestMapping("api/v1/admin")
public class AdminRestController {

    private final UserService userService;

    @Autowired
    public AdminRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    public List<User> getUserList() {
        return userService.getUserList();
    }

    @PostMapping()
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            userService.addUser(user);
            return ResponseEntity.ok("User has successful created");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error has occurred");
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<String> editUser(@PathVariable("id") long id, @RequestBody User user) {
        try {
            userService.editUser(user);
            return ResponseEntity.ok("User has successful edited");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error has occurred");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User has successful deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error has occurred");
        }
    }
}
