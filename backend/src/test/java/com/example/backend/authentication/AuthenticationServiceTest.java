package com.example.backend.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.backend.domains.Role;
import com.example.backend.domains.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.requests.AuthenticationRequest;
import com.example.backend.requests.RegistrationRequest;
import com.example.backend.responses.AuthenticationResponse;
import com.example.backend.services.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository repository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationService service;

    @Test
    void registerSavesAUserWithAnEncodedPasswordAndReturnsAToken() {
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthenticationResponse response = service.register(new RegistrationRequest("amin@example.com", "secret123"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getUsername()).isEqualTo("amin@example.com");
        assertThat(saved.getValue().getPassword()).isEqualTo("hashed");
        assertThat(saved.getValue().getRole()).isEqualTo(Role.USER);
        verify(jwtService).generateToken(saved.getValue());
        assertThat(response.getToken()).isEqualTo("jwt-token");
    }

    @Test
    void authenticateChecksCredentialsAndReturnsAToken() {
        User user = User.builder().id(1L).username("amin@example.com").password("hashed").role(Role.USER).build();
        when(repository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        AuthenticationResponse response = service.authenticate(new AuthenticationRequest("amin@example.com", "secret123"));

        ArgumentCaptor<Authentication> attempt = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(attempt.capture());
        assertThat(attempt.getValue()).isInstanceOf(UsernamePasswordAuthenticationToken.class);
        assertThat(attempt.getValue().getPrincipal()).isEqualTo("amin@example.com");
        assertThat(attempt.getValue().getCredentials()).isEqualTo("secret123");
        assertThat(response.getToken()).isEqualTo("jwt-token");
    }

    @Test
    void authenticatePropagatesBadCredentialsWithoutIssuingAToken() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> service.authenticate(new AuthenticationRequest("amin@example.com", "wrong")))
                .isInstanceOf(BadCredentialsException.class);
        verify(jwtService, never()).generateToken(any(User.class));
    }

    @Test
    void authenticateFailsWhenTheUserCannotBeLoaded() {
        when(repository.findByUsername("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.authenticate(new AuthenticationRequest("ghost@example.com", "secret123")))
                .isInstanceOf(NoSuchElementException.class);
    }
}
