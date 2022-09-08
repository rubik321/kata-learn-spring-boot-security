package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
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
    public Map<String,Object> getUserList() {
        Map<String, Object> response = new HashMap<>();
        response.put("users", userService.getUserList());
        response.put("allAuthorities", roleService.getAllRoles());
        return response;
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

    @PostMapping("/{id}/edit")
    public ResponseEntity<String> editUser(@PathVariable("id") long id, @RequestBody User user) {
        try {
            userService.editUser(user);
            return ResponseEntity.ok("User has successful edited");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error has occurred");
        }
    }

    @PostMapping("/{id}/delete")
    public ResponseEntity<String> deleteUser(@PathVariable("id") long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User has successful deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error has occurred");
        }
    }
}
