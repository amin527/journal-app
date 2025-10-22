package com.example.backend.configurations;

import com.example.backend.services.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        // if the authHeader is populated and does not follow the bearer scheme
        if (authHeader != null && !authHeader.startsWith("Bearer ")) {
            // pass the request to the next filter in the security chain
            filterChain.doFilter(request, response);
            // terminate the current filter
            return;
        }
        if (authHeader != null) {
            // identify the jwt token by parsing 7 characters forward on the authHeader to remove the "Bearer "
            jwt = authHeader.substring(7);
            // extract the username from the jwt token
            username = jwtService.extractUsername(jwt);
            // if username is null and no users are currently authenticated in the security context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // load the user (identified from the jwt token) from the database into a userDetails object
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                // check that the username from userDetails and that from jwt match (double check)
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // create an authentication token that represents the authentication status of the current user
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    // attach additional details (i.e. IP address, etc.) to the authentication token
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    // store the authentication token in the security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
