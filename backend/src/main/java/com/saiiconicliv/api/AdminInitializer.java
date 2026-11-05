package com.saiiconicliv.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createInitialAdmin(
            AdminUserRepository repository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:}") String email,
            @Value("${app.admin.password:}") String password) {

        return args -> {
            if (email.isBlank() || password.isBlank()) {
                System.out.println("Initial admin credentials not configured.");
                return;
            }

            if (repository.findByEmailIgnoreCase(email.trim()).isEmpty()) {
                AdminUser admin = new AdminUser(
                        email.trim(),
                        passwordEncoder.encode(password)
                );

                repository.save(admin);
                System.out.println("Initial admin account created.");
            } else {
                System.out.println("Admin account already exists.");
            }
        };
    }
}