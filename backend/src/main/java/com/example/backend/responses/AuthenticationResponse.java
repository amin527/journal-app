package com.example.backend.responses;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse extends GenericResponse {
    private String token;
}
