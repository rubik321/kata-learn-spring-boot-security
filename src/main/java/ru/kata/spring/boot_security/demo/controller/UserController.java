package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.dao.RoleDao;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.UserService;

@Controller
@RequestMapping("admin")
public class UserController {

    private final UserService userService;
    private final RoleDao roleDao;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserController(UserService userService, RoleDao roleDao, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.roleDao = roleDao;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping()
    public String getUserList(Model model) {
        model.addAttribute("users", userService.getUserList());
        return "user/users";
    }

    @GetMapping("/{id}")
    public String getUser(@PathVariable("id") long id, Model model) {
        model.addAttribute("user", userService.getUser(id));
        return "user/user";
    }

    @GetMapping("/new")
    public String getUserCreationPage(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("allAuthorities", roleDao.findAll());
        return "user/new_user";
    }

    @PostMapping()
    public String createUser(@ModelAttribute("user") User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userService.addUser(user);
        return "redirect:/admin";
    }

    @GetMapping("/{id}/edit")
    public String getUserEditPage(@PathVariable("id") long id, Model model) {
        model.addAttribute("user", userService.getUser(id));
        model.addAttribute("allAuthorities", roleDao.findAll());
        return "user/edit_user";
    }

    @PatchMapping("/{id}")
    public String editUser(@PathVariable("id") long id, @ModelAttribute("user") User user) {
        String newPassword = user.getPassword();
        if (newPassword.equals("")) {
            user.setPassword(userService.getUser(id).getPassword());
        } else {
            user.setPassword(passwordEncoder.encode(newPassword));
        }
        userService.editUser(user);
        return "redirect:/admin";
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable("id") long id) {
        userService.deleteUser(id);
        return "redirect:/admin";
    }
}
