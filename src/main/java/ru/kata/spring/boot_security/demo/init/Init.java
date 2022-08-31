package ru.kata.spring.boot_security.demo.init;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Configuration
public class Init {

    private static UserService userService;
    private static RoleRepository roleRepository;

    @Autowired
    private void setUserService(UserService userService) {
        Init.userService = userService;
    }

    @Autowired
    private void setRoleRepository(RoleRepository roleRepository) {
        Init.roleRepository = roleRepository;
    }

    public static void run() {
        Role role1 = new Role();
        role1.setAuthority("ROLE_ADMIN");
        roleRepository.save(role1);

        Role role2 = new Role();
        role2.setAuthority("ROLE_USER");
        roleRepository.save(role2);

        User user1 = new User();
        user1.setName("admin");
        user1.setLastName("admin");
        user1.setAge(23);
        user1.setEmail("admin@mail.ru");
        user1.setPassword("admin");
        user1.setAuthorities(new HashSet<>(Arrays.asList(role1, role2)));
        userService.addUser(user1);

        User user2 = new User();
        user2.setName("user");
        user2.setLastName("user");
        user2.setAge(24);
        user2.setEmail("user@mail.ru");
        user2.setPassword("user");
        user2.setAuthorities(new HashSet<>(List.of(role2)));
        userService.addUser(user2);
    }
}
