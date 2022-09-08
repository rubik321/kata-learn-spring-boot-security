package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;

public interface UserService extends UserDetailsService {
    User addUser(User user);
    User getUser(long id);
    List<User> getUserList();
    User editUser(User user);
    void deleteUser(long id);
}
