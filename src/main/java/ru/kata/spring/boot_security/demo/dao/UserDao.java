package ru.kata.spring.boot_security.demo.dao;

import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;
import java.util.Optional;

public interface UserDao {
    void addUser(User user);
    User getUser(long id);
    Optional<User> getUserByUsername(String username);
    List<User> getUserList();
    User editUser(User user);
    void deleteUser(long id);
}
