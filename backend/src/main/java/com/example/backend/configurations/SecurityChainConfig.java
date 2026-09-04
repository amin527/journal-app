package com.example.backend.configurations;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityChainConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter authenticationFilter)
                        throws Exception {
                http   
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                // instruct Spring security to disable CSRF protection
                                .csrf(AbstractHttpConfigurer::disable)
                                // dictate the authorization rules for incoming HTTP requests
                                .authorizeHttpRequests(auth -> auth
                                                // requests whose path starts with /api/v1/auth/ do not require
                                                // authentication (public accessibility)
                                                .requestMatchers("/auth/**").permitAll()
                                                // all other requests require authentication
                                                .anyRequest().authenticated())
                                // instruct Spring security of how user sessions will be managed for
                                // configuration purposes
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                // instruct Spring security of the Authentication Provider that will be used for
                                // configuration purposes
                                .authenticationProvider(authenticationProvider)
                                // insert the JwtAuthenticationFilter before the built-in
                                // UsernamePasswordAuthenticationFilter in the security filter chain
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://journal-app-frontend-q7lf.vercel.app"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
                configuration.setExposedHeaders(List.of("Authorization"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
