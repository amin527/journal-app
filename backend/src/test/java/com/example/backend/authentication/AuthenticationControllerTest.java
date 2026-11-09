package com.example.backend.authentication;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.backend.domains.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.requests.AuthenticationRequest;
import com.example.backend.requests.RegistrationRequest;
import com.example.backend.responses.AuthenticationResponse;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerTest {

    private static final String CREDENTIALS = "{\"username\":\"amin@example.com\",\"password\":\"secret123\"}";

    @Mock
    private AuthenticationService service;
    @Mock
    private UserRepository repository;

    @InjectMocks
    private AuthenticationController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void registerCreatesANewUserAndReturnsTheirToken() throws Exception {
        when(repository.findByUsername("amin@example.com")).thenReturn(Optional.empty());
        when(service.register(new RegistrationRequest("amin@example.com", "secret123")))
                .thenReturn(AuthenticationResponse.builder().token("jwt-token").build());

        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(CREDENTIALS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    void registerRejectsAnExistingUsername() throws Exception {
        when(repository.findByUsername("amin@example.com")).thenReturn(Optional.of(new User()));

        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(CREDENTIALS))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request failed: user already exists or token invalid"))
                .andExpect(jsonPath("$.token").doesNotExist());

        verify(service, never()).register(any());
    }

    @Test
    void authenticateReturnsATokenForValidCredentials() throws Exception {
        when(service.authenticate(new AuthenticationRequest("amin@example.com", "secret123")))
                .thenReturn(AuthenticationResponse.builder().token("jwt-token").build());

        mockMvc.perform(post("/auth/authenticate").contentType(MediaType.APPLICATION_JSON).content(CREDENTIALS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }
}
