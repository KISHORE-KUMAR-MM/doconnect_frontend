package com.example.qa.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(cs -> cs.disable())
            .authorizeHttpRequests(auth -> auth

                // 👉 allow email test endpoint WITHOUT TOKEN
                .requestMatchers("/api/test-email/**").permitAll()

                // allow login/register if existed
                .requestMatchers("/api/auth/**").permitAll()

                // For Admin
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                // For Q&A
                .requestMatchers("/api/questions/**", "/api/answers/**")
                    .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                .anyRequest().authenticated()
            )

            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager manager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
