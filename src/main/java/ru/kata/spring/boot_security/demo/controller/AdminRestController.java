package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.net.URI;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("api/v1/admin")
public class AdminRestController {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public AdminRestController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping()
    public ResponseEntity<List<User>> getUserList() {
        List<User> users = userService.getUserList();
        if (users == null) {
            return ResponseEntity.badRequest().build();
        } else {
            return ResponseEntity.ok(users);
        }
    }

    @PostMapping()
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.addUser(user);
        if (createdUser == null) {
            return ResponseEntity.badRequest().build();
        } else {
            URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(createdUser.getId())
                    .toUri();
            return ResponseEntity.created(uri).body(createdUser);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable("id") long id) {
        User user = userService.getUser(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(user);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<User> editUser(@PathVariable("id") long id, @RequestBody User user) {
        User editedUser = userService.editUser(user);
        if (editedUser == null) {
            return ResponseEntity.badRequest().build();
        } else {
            return ResponseEntity.ok(user);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
