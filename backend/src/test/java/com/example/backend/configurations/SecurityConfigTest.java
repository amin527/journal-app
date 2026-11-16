package com.example.backend.configurations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;

import com.example.backend.domains.Role;
import com.example.backend.domains.User;
import com.example.backend.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Mock
    private UserRepository userRepository;

    private SecurityConfig config;

    @BeforeEach
    void setUp() {
        config = new SecurityConfig(userRepository);
    }

    @Test
    void passwordEncoderIsBCryptAndVerifiesItsOwnHashes() {
        PasswordEncoder encoder = config.passwordEncoder();
        String hash = encoder.encode("secret123");

        assertThat(encoder).isInstanceOf(BCryptPasswordEncoder.class);
        assertThat(hash).isNotEqualTo("secret123");
        assertThat(encoder.matches("secret123", hash)).isTrue();
        assertThat(encoder.matches("wrong", hash)).isFalse();
    }

    @Test
    void userDetailsServiceLoadsUsersFromTheRepository() {
        User user = User.builder().username("amin@example.com").role(Role.USER).build();
        when(userRepository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));

        assertThat(config.userDetailsService().loadUserByUsername("amin@example.com")).isSameAs(user);
    }

    @Test
    void userDetailsServiceThrowsForAnUnknownUser() {
        when(userRepository.findByUsername("ghost@example.com")).thenReturn(Optional.empty());
        UserDetailsService service = config.userDetailsService();

        assertThatThrownBy(() -> service.loadUserByUsername("ghost@example.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("Username not found");
    }

    @Test
    void authenticationProviderAcceptsTheCorrectPassword() {
        PasswordEncoder encoder = config.passwordEncoder();
        User user = User.builder().username("amin@example.com").password(encoder.encode("secret123")).role(Role.USER).build();
        when(userRepository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));
        AuthenticationProvider provider = config.authenticationProvider(config.userDetailsService(), encoder);

        Authentication result = provider.authenticate(
                new UsernamePasswordAuthenticationToken("amin@example.com", "secret123"));

        assertThat(result.isAuthenticated()).isTrue();
        assertThat(result.getPrincipal()).isSameAs(user);
    }

    @Test
    void authenticationProviderRejectsTheWrongPassword() {
        PasswordEncoder encoder = config.passwordEncoder();
        User user = User.builder().username("amin@example.com").password(encoder.encode("secret123")).role(Role.USER).build();
        when(userRepository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));
        AuthenticationProvider provider = config.authenticationProvider(config.userDetailsService(), encoder);

        assertThatThrownBy(() -> provider.authenticate(
                        new UsernamePasswordAuthenticationToken("amin@example.com", "wrong")))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void corsAllowsTheConfiguredOriginsMethodsAndHeaders() {
        SecurityChainConfig chainConfig = new SecurityChainConfig(null, null);
        CorsConfiguration cors = chainConfig.corsConfigurationSource()
                .getCorsConfiguration(new MockHttpServletRequest("GET", "/get-user-info"));
        String expectedOrigins = System.getenv().getOrDefault("CORS_ALLOWED_ORIGINS", "http://localhost:3000");

        assertThat(cors).isNotNull();
        assertThat(cors.getAllowedOrigins()).containsExactly(expectedOrigins.split(","));
        assertThat(cors.getAllowedMethods()).containsExactlyInAnyOrder("GET", "POST", "PUT", "DELETE", "OPTIONS");
        assertThat(cors.getAllowedHeaders()).containsExactlyInAnyOrder("Authorization", "Content-Type");
        assertThat(cors.getAllowCredentials()).isTrue();
    }
}
