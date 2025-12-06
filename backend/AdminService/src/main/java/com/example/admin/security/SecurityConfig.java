package com.example.admin.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // Allow admin login + register
                .requestMatchers("/api/admin/auth/**").permitAll()

                // Admin-Only Moderation APIs
                .requestMatchers("/api/admin/moderation/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/admin/users/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/admin/questions/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/admin/answers/**").hasAuthority("ROLE_ADMIN")

                .anyRequest().authenticated()
            )

            // Use JWT instead of sessions
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Add JWT filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
