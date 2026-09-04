package com.example.backend.authentication;

import com.example.backend.domains.Role;
import com.example.backend.domains.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.requests.AuthenticationRequest;
import com.example.backend.requests.RegistrationRequest;
import com.example.backend.responses.AuthenticationResponse;
import com.example.backend.services.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegistrationRequest request){
        // build a User object
        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        // save the User object into the database
        repository.save(user);
        // build a jwt token using the User object
        var jwtToken = jwtService.generateToken(user);
        // build an AuthenticationResponse object around the jwt token and return it
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request){
        // pass the provided username and password to the Authentication provider configured within the AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        // query the database for the user
        var user = repository.findByUsername(request.getUsername()).orElseThrow();
        // build a jwt token using the user
        var jwtToken = jwtService.generateToken(user);
        // build an AuthenticationResponse object around the jwt token and return it
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}
