package com.cabbooking.userservice.service;

import com.cabbooking.userservice.dto.LoginRequest;
import com.cabbooking.userservice.dto.UserRegistrationRequest;
import com.cabbooking.userservice.exception.ResourceNotFoundException;
import com.cabbooking.userservice.exception.UnauthorizedException;
import com.cabbooking.userservice.exception.UserAlreadyExistsException;
import com.cabbooking.userservice.model.User;
import com.cabbooking.userservice.repository.UserRepository;
import com.cabbooking.userservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    public User registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setRole(User.UserRole.USER);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // Publish Kafka event for user registration
        kafkaProducerService.publishUserRegistrationEvent(
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getEmail());

        return savedUser;
    }

    public Optional<User> authenticateUser(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword()) && user.isActive()) {
                // Publish Kafka event for user login
                kafkaProducerService.publishUserLoginEvent(
                        user.getId(),
                        user.getFirstName(),
                        user.getEmail());
                return userOpt;
            }
        }
        throw new UnauthorizedException("Invalid email or password");
    }

    public String generateToken(String email) {
        return jwtTokenProvider.generateTokenFromEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " not found"));

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setAddress(userDetails.getAddress());

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " not found"));
        user.setActive(false);
        userRepository.save(user);
    }
}