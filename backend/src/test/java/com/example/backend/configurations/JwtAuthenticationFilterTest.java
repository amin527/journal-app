package com.example.backend.configurations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.example.backend.domains.Role;
import com.example.backend.domains.User;
import com.example.backend.services.JwtService;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private MockFilterChain chain;
    private User user;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        chain = new MockFilterChain();
        user = User.builder().id(1L).username("amin@example.com").password("hashed").role(Role.USER).build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void passesThroughUnauthenticatedWhenThereIsNoAuthorizationHeader() throws Exception {
        filter.doFilter(request, response, chain);

        assertThat(chain.getRequest()).isSameAs(request);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void passesThroughUnauthenticatedForANonBearerHeader() throws Exception {
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        filter.doFilter(request, response, chain);

        assertThat(chain.getRequest()).isSameAs(request);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void authenticatesTheUserForAValidBearerToken() throws Exception {
        request.addHeader("Authorization", "Bearer good-token");
        when(jwtService.extractUsername("good-token")).thenReturn("amin@example.com");
        when(userDetailsService.loadUserByUsername("amin@example.com")).thenReturn(user);
        when(jwtService.isTokenValid("good-token", user)).thenReturn(true);

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isInstanceOf(UsernamePasswordAuthenticationToken.class);
        assertThat(authentication.getPrincipal()).isSameAs(user);
        assertThat(authentication.getAuthorities()).extracting("authority").containsExactly("USER");
        assertThat(authentication.isAuthenticated()).isTrue();
        assertThat(chain.getRequest()).isSameAs(request);
    }

    @Test
    void leavesTheRequestUnauthenticatedForAnInvalidToken() throws Exception {
        request.addHeader("Authorization", "Bearer bad-token");
        when(jwtService.extractUsername("bad-token")).thenReturn("amin@example.com");
        when(userDetailsService.loadUserByUsername("amin@example.com")).thenReturn(user);
        when(jwtService.isTokenValid("bad-token", user)).thenReturn(false);

        filter.doFilter(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(chain.getRequest()).isSameAs(request);
    }

    @Test
    void skipsLoadingTheUserWhenTheTokenHasNoSubject() throws Exception {
        request.addHeader("Authorization", "Bearer no-subject");
        when(jwtService.extractUsername("no-subject")).thenReturn(null);

        filter.doFilter(request, response, chain);

        verify(userDetailsService, never()).loadUserByUsername(anyString());
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(chain.getRequest()).isSameAs(request);
    }

    @Test
    void keepsAnExistingAuthentication() throws Exception {
        Authentication existing = new UsernamePasswordAuthenticationToken("someone", null, java.util.List.of());
        SecurityContextHolder.getContext().setAuthentication(existing);
        request.addHeader("Authorization", "Bearer good-token");
        when(jwtService.extractUsername("good-token")).thenReturn("amin@example.com");

        filter.doFilter(request, response, chain);

        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(jwtService, never()).isTokenValid(anyString(), any());
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(existing);
    }
}
