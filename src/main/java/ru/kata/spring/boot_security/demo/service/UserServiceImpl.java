package ru.kata.spring.boot_security.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Transactional
    public User addUser(User user) throws IllegalStateException {
        Optional<User> userOptional = userRepository.findUserByEmail(user.getEmail());
        if (userOptional.isPresent()) {
            throw new IllegalStateException("User exists!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public User getUser(long id) {
        return userRepository.findById(id).orElseThrow(
                () -> new IllegalStateException(String.format("User with id = %s not found", id))
        );
    }
    
    public List<User> getUserList() {
        return userRepository.findAll();
    }
    
    @Transactional
    public User editUser(User user) {
        String newPassword = user.getPassword();

        if (!passwordEncoder.matches(newPassword, getUser(user.getId()).getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        return userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(long id) throws IllegalStateException {
        boolean isUserExists = userRepository.existsById(id);
        if (!isUserExists) {
            throw new IllegalStateException(String.format("User with id = %s does not exist", id));
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findUserByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException(String.format("Email %s not found", email))
        );
    }
}
