package ru.kata.spring.boot_security.demo.service;

import web.model.User;

import java.util.List;

public interface UserService {
    void addUser(User user);
    User getUser(long id);
    List<User> getUserList();
    User editUser(User user);
    void deleteUser(long id);
}
