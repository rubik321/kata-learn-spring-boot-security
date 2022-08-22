package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

@Controller
@RequestMapping("admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping()
    public String getUserList(Model model) {
        model.addAttribute("users", userService.getUserList());
        return "main";
    }

    @GetMapping("/{id}")
    public String getUser(@PathVariable("id") long id, Model model) {
        model.addAttribute("user", userService.getUser(id));
        return "user/user";
    }

    @GetMapping("/new")
    public String getUserCreationPage(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("allAuthorities", roleService.getAllRoles());
        return "user/new_user";
    }

    @PostMapping()
    public String createUser(@ModelAttribute("user") User user) {
        userService.addUser(user);
        return "redirect:/admin";
    }

    @GetMapping("/{id}/edit")
    public String getUserEditPage(@PathVariable("id") long id, Model model) {
        model.addAttribute("user", userService.getUser(id));
        model.addAttribute("allAuthorities", roleService.getAllRoles());
        return "user/edit_user";
    }

    @PatchMapping("/{id}")
    public String editUser(@PathVariable("id") long id, @ModelAttribute("user") User user) {
        userService.editUser(user);
        return "redirect:/admin";
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable("id") long id) {
        userService.deleteUser(id);
        return "redirect:/admin";
    }
}
