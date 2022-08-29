package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleServiceImpl;
import ru.kata.spring.boot_security.demo.service.UserServiceImpl;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserServiceImpl userServiceImpl;
    private final RoleServiceImpl roleServiceImpl;

    @Autowired
    public AdminController(UserServiceImpl userServiceImpl, RoleServiceImpl roleServiceImpl) {
        this.userServiceImpl = userServiceImpl;
        this.roleServiceImpl = roleServiceImpl;
    }

    @GetMapping()
    public String getUserList(Model model) {
        model.addAttribute("principal", SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        model.addAttribute("users", userServiceImpl.getUserList());
        model.addAttribute("newUser", new User());
        model.addAttribute("allAuthorities", roleServiceImpl.getAllRoles());
        return "admin";
    }

    @GetMapping("/{id}")
    public String getUser(@PathVariable("id") long id, Model model) {
        model.addAttribute("user", userServiceImpl.getUser(id));
        return "user/user";
    }

    @GetMapping("/new")
    public String getUserCreationPage(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("allAuthorities", roleServiceImpl.getAllRoles());
        return "user/new_user";
    }

    @PostMapping()
    public String createUser(@ModelAttribute("user") User user) {
        userServiceImpl.addUser(user);
        return "redirect:/admin";
    }

    @GetMapping("/{id}/edit")
    public String getUserEditPage(@PathVariable("id") long id, Model model) {
        model.addAttribute("user", userServiceImpl.getUser(id));
        model.addAttribute("allAuthorities", roleServiceImpl.getAllRoles());
        return "user/edit_user";
    }

    @PatchMapping("/{id}")
    public String editUser(@PathVariable("id") long id, @ModelAttribute("user") User user) {
        userServiceImpl.editUser(user);
        return "redirect:/admin";
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable("id") long id) {
        userServiceImpl.deleteUser(id);
        return "redirect:/admin";
    }
}
